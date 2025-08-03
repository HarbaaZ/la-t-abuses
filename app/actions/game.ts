'use server';

import { revalidatePath } from 'next/cache';
import { getRandomCustomQuestions } from '../data/custom-questions';
import { questions } from '../data/questions';
import { getGame, setGame } from '../lib/kv';
import { Player, Question, RoundResult } from '../types/game';

async function generateQuestionsForGame(count: number = 25): Promise<Question[]> {
  try {
    console.log(`Generating ${count} custom questions for game`);
    
    // Utiliser directement les questions personnalisées
    const customQuestions = getRandomCustomQuestions(count);
    
    // Si on n'a pas assez de questions personnalisées, compléter avec les questions par défaut
    if (customQuestions.length < count) {
      const remainingCount = count - customQuestions.length;
      const defaultQuestions = questions.slice(0, remainingCount);
      const allQuestions = [...customQuestions, ...defaultQuestions];
      console.log(`Using ${customQuestions.length} custom questions + ${defaultQuestions.length} default questions`);
      return allQuestions;
    }
    
    console.log(`Using ${customQuestions.length} custom questions`);
    return customQuestions;
  } catch (error) {
    console.error('Error generating questions for game:', error);
    // En cas d'échec, utiliser les questions statiques
    console.log('Fallback to default questions');
    return questions.slice(0, count);
  }
}

function getRandomQuestion(gameQuestions: Question[], usedQuestionIds: string[] = []): Question {
  // Filtrer les questions qui n'ont pas encore été utilisées
  const availableQuestions = gameQuestions.filter(q => !usedQuestionIds.includes(q.id));
  
  // Si toutes les questions ont été utilisées, on peut réinitialiser (optionnel)
  if (availableQuestions.length === 0) {
    console.log('Toutes les questions ont été utilisées, réinitialisation de la liste');
    return gameQuestions[Math.floor(Math.random() * gameQuestions.length)];
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}

// Server Action pour rejoindre une partie
export async function joinGame(gameId: string, playerName: string, playerId: string) {
  console.log(`Joining game: ${gameId}, Player: ${playerName} (${playerId})`);
  
  let game = await getGame(gameId);
  
  if (!game) {
    console.log(`Creating new game: ${gameId}`);
    game = {
      id: gameId,
      players: [],
      currentPlayerIndex: 0,
      currentQuestion: null,
      gamePhase: 'waiting',
      guesses: [],
      maxScore: 3,
      roundNumber: 0,
      currentTurnPlayerId: null,
      lastUpdate: Date.now(),
      usedQuestions: [],
      gameQuestions: []
    };
    await setGame(gameId, game);
  }

  // Vérifier si le nom existe déjà
  const existingPlayer = game.players.find((p: Player) => p.name === playerName);
  if (existingPlayer) {
    console.log(`Player name already exists: ${playerName}`);
    throw new Error('Un joueur avec ce nom existe déjà dans la partie');
  }

  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    isActive: true,
    isHost: game.players.length === 0
  };

  game.players.push(player);
  game.lastUpdate = Date.now();

  console.log(`Player joined successfully: ${playerName}, Total players: ${game.players.length}`);

  await setGame(gameId, game);
  revalidatePath('/');
  return { success: true, game };
}

// Server Action pour démarrer une partie
export async function startGame(gameId: string, playerId: string, settings: { maxScore: number }) {
  console.log(`Starting game: ${gameId}, Player: ${playerId}, MaxScore: ${settings.maxScore}`);
  
  const game = await getGame(gameId);
  
  if (!game) {
    console.log(`Game not found for start: ${gameId}`);
    throw new Error('Game not found');
  }

  const player = game.players.find((p: Player) => p.id === playerId);
  if (!player?.isHost) {
    console.log(`Player ${playerId} is not host`);
    throw new Error('Only host can start game');
  }

  try {
    // Mettre à jour l'état du jeu AVANT de générer les questions
    game.gamePhase = 'playing';
    game.maxScore = settings.maxScore;
    game.lastUpdate = Date.now();
    
    console.log(`Generating questions for game: ${gameId}`);
    
    // Générer des questions pour la partie
    const generatedQuestions = await generateQuestionsForGame(settings.maxScore * 2);
    
    console.log(`Generated ${generatedQuestions.length} questions for game: ${gameId}`);
    
    // Stocker les questions générées
    game.gameQuestions = generatedQuestions;
    
    // Sélectionner la première question
    game.currentQuestion = getRandomQuestion(game.gameQuestions, game.usedQuestions);
    if (game.currentQuestion) {
      game.usedQuestions.push(game.currentQuestion.id);
      console.log(`Selected first question: ${game.currentQuestion.text}`);
    } else {
      console.error(`No questions available for game: ${gameId}`);
      // En cas d'erreur, revenir à l'état d'attente
      game.gamePhase = 'waiting';
      throw new Error('Impossible de générer des questions pour la partie');
    }
    
    // Initialiser la partie
    game.roundNumber = 1;
    game.currentTurnPlayerId = game.players[0].id;
    game.lastUpdate = Date.now();
    
    console.log(`Game started successfully: ${gameId}, First player: ${game.players[0].name}`);

    await setGame(gameId, game);
    revalidatePath('/');
    return { success: true, game };
  } catch (error) {
    console.error(`Error starting game ${gameId}:`, error);
    
    // En cas d'erreur, revenir à l'état d'attente
    game.gamePhase = 'waiting';
    game.lastUpdate = Date.now();
    
    throw new Error('Erreur lors du démarrage de la partie. Veuillez réessayer.');
  }
}

// Server Action pour soumettre une supposition
export async function submitGuess(gameId: string, playerId: string, value: number) {
  const game = await getGame(gameId);
  
  if (!game) {
    console.log(`Game not found: ${gameId}`);
    throw new Error('Game not found');
  }

  if (game.gamePhase !== 'playing') {
    console.log(`Game not in playing state. Current phase: ${game.gamePhase}, Game ID: ${gameId}`);
    throw new Error('Game not in playing state');
  }

  const player = game.players.find((p: Player) => p.id === playerId);
  if (!player) {
    console.log(`Player not found: ${playerId} in game ${gameId}`);
    throw new Error('Player not found');
  }

  // Vérifier que c'est le tour du joueur
  if (game.currentTurnPlayerId !== playerId) {
    console.log(`Not player's turn. Expected: ${game.currentTurnPlayerId}, Got: ${playerId}`);
    throw new Error('Ce n\'est pas votre tour de jouer');
  }

  // Vérifier que la supposition est supérieure à la précédente
  const lastGuess = game.guesses[game.guesses.length - 1];
  if (lastGuess && value <= lastGuess.value) {
    console.log(`Invalid guess value. Last: ${lastGuess.value}, New: ${value}`);
    throw new Error('Votre supposition doit être supérieure à la précédente');
  }

  const guess = {
    playerId,
    value,
    timestamp: Date.now()
  };

  game.guesses.push(guess);
  
  // Vérifier si la supposition est exactement égale à la bonne réponse
  if (game.currentQuestion && value === game.currentQuestion.answer) {
    // Le joueur a trouvé la bonne réponse ! Il perd un point
    player.score--;
    
    console.log(`Player ${player.name} found the exact answer! Score decreased to ${player.score}`);
    
    // Vérifier si le joueur a atteint le score maximum (score négatif = gagnant)
    if (player.score <= -game.maxScore) {
      // Le joueur qui a trouvé la bonne réponse gagne la partie
      const losers = game.players.filter((p: Player) => p.id !== player.id);
      game.gamePhase = 'finished';
      game.lastUpdate = Date.now();
      
      const roundResult: RoundResult = {
        correctAnswer: game.currentQuestion.answer,
        guesses: [...game.guesses],
        loser: null,
        challengeIssuer: null,
        challengedPlayer: null
      };
      
      // Stocker le résultat pour que tous les joueurs puissent y accéder
      game.lastRoundResult = roundResult;
      
      console.log(`Game ended because ${player.name} found the answer and reached negative max score. Winner: ${player.name}`);
      
      await setGame(gameId, game);
      revalidatePath('/');
      return { 
        success: true, 
        game, 
        roundResult, 
        gameEnded: true, 
        winners: [player],
        exactAnswerFound: true,
        answerFinder: player
      };
    } else {
      // Nouvelle manche - le joueur qui a trouvé la bonne réponse commence
      // Créer le RoundResult avec la question actuelle AVANT de la changer
      const roundResult: RoundResult = {
        correctAnswer: game.currentQuestion!.answer,
        guesses: [...game.guesses],
        loser: null,
        challengeIssuer: null,
        challengedPlayer: null
      };
      
      // Maintenant changer la question pour la nouvelle manche
      game.currentQuestion = getRandomQuestion(game.gameQuestions, game.usedQuestions);
      if (game.currentQuestion) {
        game.usedQuestions.push(game.currentQuestion.id);
      }
      game.guesses = [];
      game.roundNumber++;
      game.currentTurnPlayerId = player.id;
      game.lastUpdate = Date.now();
      
      // Stocker le résultat pour que tous les joueurs puissent y accéder
      game.lastRoundResult = roundResult;
      
      console.log(`New round started because ${player.name} found the answer. Score: ${player.score}, Round: ${game.roundNumber}`);
      
      await setGame(gameId, game);
      revalidatePath('/');
      return { 
        success: true, 
        game, 
        roundResult,
        exactAnswerFound: true,
        answerFinder: player
      };
    }
  }
  
  // Passer au joueur suivant (cas normal)
  const currentPlayerIndex = game.players.findIndex((p: Player) => p.id === playerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
  game.currentTurnPlayerId = game.players[nextPlayerIndex].id;
  game.lastUpdate = Date.now();

  console.log(`Guess submitted successfully. Player: ${player.name}, Value: ${value}, Next player: ${game.players[nextPlayerIndex].name}`);

  await setGame(gameId, game);
  revalidatePath('/');
  return { success: true, game };
}

// Server Action pour lancer un défi
export async function issueChallenge(gameId: string, playerId: string, targetPlayerId: string) {
  const game = await getGame(gameId);
  
  if (!game) {
    console.log(`Game not found for challenge: ${gameId}`);
    throw new Error('Game not found');
  }

  if (game.gamePhase !== 'playing') {
    console.log(`Game not in playing state for challenge. Current phase: ${game.gamePhase}, Game ID: ${gameId}`);
    throw new Error('Game not in playing state');
  }

  const challenger = game.players.find((p: Player) => p.id === playerId);
  const challenged = game.players.find((p: Player) => p.id === targetPlayerId);
  
  if (!challenger || !challenged) {
    console.log(`Player not found for challenge. Challenger: ${playerId}, Challenged: ${targetPlayerId}`);
    throw new Error('Player not found');
  }

  // Évaluer le défi
  const lastGuess = game.guesses[game.guesses.length - 1];
  if (!lastGuess || !game.currentQuestion) {
    console.log(`No guess to challenge. Guesses: ${game.guesses.length}, Question: ${!!game.currentQuestion}`);
    throw new Error('No guess to challenge');
  }

  const isLastGuessCorrect = lastGuess.value <= game.currentQuestion.answer;
  const loser = isLastGuessCorrect ? challenger : challenged;
  
  loser.score++;

  console.log(`Challenge issued. Challenger: ${challenger.name}, Challenged: ${challenged.name}, Loser: ${loser.name}, Score: ${loser.score}`);

  const roundResult: RoundResult = {
    correctAnswer: game.currentQuestion.answer,
    guesses: [...game.guesses],
    loser,
    challengeIssuer: challenger,
    challengedPlayer: challenged
  };

  // Vérifier si le jeu est terminé
  if (loser.score >= game.maxScore) {
    const winners = game.players.filter((p: Player) => p.id !== loser.id);
    game.gamePhase = 'finished';
    game.lastUpdate = Date.now();
    
    // Stocker le résultat pour que tous les joueurs puissent y accéder
    game.lastRoundResult = roundResult;
    
    console.log(`Game ended. Winners: ${winners.map(w => w.name).join(', ')}`);
    
    await setGame(gameId, game);
    revalidatePath('/');
    return { success: true, game, roundResult, gameEnded: true, winners };
  } else {
    // Nouvelle manche - le joueur suivant dans l'ordre commence
    game.currentQuestion = getRandomQuestion(game.gameQuestions, game.usedQuestions);
    if (game.currentQuestion) {
      game.usedQuestions.push(game.currentQuestion.id);
    }
    game.guesses = [];
    game.roundNumber++;
    
    // Trouver le joueur suivant dans l'ordre (après le dernier joueur qui a joué)
    const lastGuessPlayerIndex = game.players.findIndex((p: Player) => p.id === lastGuess.playerId);
    const nextPlayerIndex = (lastGuessPlayerIndex + 1) % game.players.length;
    game.currentTurnPlayerId = game.players[nextPlayerIndex].id;
    
    game.lastUpdate = Date.now();
    
    // Stocker le résultat pour que tous les joueurs puissent y accéder
    game.lastRoundResult = roundResult;
    
    console.log(`New round started. First player: ${game.players[nextPlayerIndex].name}, Round: ${game.roundNumber}`);
    
    await setGame(gameId, game);
    revalidatePath('/');
    return { success: true, game, roundResult };
  }
}

// Server Action pour obtenir l'état d'un jeu
export async function getGameState(gameId: string) {
  console.log(`Getting game state for: ${gameId}`);
  
  const game = await getGame(gameId);
  if (!game) {
    console.log(`Game not found: ${gameId}`);
    return null;
  }
  
  console.log(`Game found: ${gameId}, returning game data`);
  return game;
}

// Server Action pour nettoyer le résultat de manche
export async function clearRoundResult(gameId: string) {
  const game = await getGame(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  game.lastRoundResult = null;
  game.lastUpdate = Date.now();
  
  await setGame(gameId, game);
  revalidatePath('/');
  return { success: true, game };
} 