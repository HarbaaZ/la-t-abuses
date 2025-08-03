import { NextRequest, NextResponse } from 'next/server';
import { GameState, Player, RoundResult } from '../../types/game';

// Stockage global des jeux (en mémoire pour Vercel)
const games = new Map<string, GameState>();

// Questions du jeu
const questions = [
  { id: '1', text: 'Combien de pays composent l\'Union Européenne en 2024 ?', answer: 27, category: 'géographie' },
  { id: '2', text: 'Combien d\'os compte le corps humain adulte ?', answer: 206, category: 'anatomie' },
  { id: '3', text: 'Combien de joueurs composent une équipe de football sur le terrain ?', answer: 11, category: 'sport' },
  { id: '4', text: 'Combien de lettres compte l\'alphabet français ?', answer: 26, category: 'langue' },
  { id: '5', text: 'Combien de planètes compte notre système solaire ?', answer: 8, category: 'astronomie' },
  { id: '6', text: 'Combien de jours compte une année bissextile ?', answer: 366, category: 'temps' },
  { id: '7', text: 'Combien de couleurs compte l\'arc-en-ciel ?', answer: 7, category: 'nature' },
  { id: '8', text: 'Combien de doigts a un être humain ?', answer: 10, category: 'anatomie' },
  { id: '9', text: 'Combien de côtés a un hexagone ?', answer: 6, category: 'géométrie' },
  { id: '10', text: 'Combien de minutes compte une heure ?', answer: 60, category: 'temps' },
  { id: '11', text: 'Combien de joueurs composent une équipe de basket-ball sur le terrain ?', answer: 5, category: 'sport' },
  { id: '12', text: 'Combien de continents compte notre planète ?', answer: 7, category: 'géographie' },
  { id: '13', text: 'Combien de notes de musique y a-t-il dans une octave ?', answer: 8, category: 'musique' },
  { id: '14', text: 'Combien de joueurs composent une équipe de volley-ball sur le terrain ?', answer: 6, category: 'sport' },
  { id: '15', text: 'Combien de jours compte le mois de février en année normale ?', answer: 28, category: 'temps' }
];

function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');
  
  if (!gameId) {
    return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
  }

  const game = games.get(gameId);
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  return NextResponse.json(game);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, gameId, playerName, playerId, value, targetPlayerId, settings } = body;

  switch (action) {
    case 'joinGame':
      return handleJoinGame(gameId, playerName, playerId);
    case 'startGame':
      return handleStartGame(gameId, playerId, settings);
    case 'submitGuess':
      return handleSubmitGuess(gameId, playerId, value);
    case 'issueChallenge':
      return handleIssueChallenge(gameId, playerId, targetPlayerId);
    case 'nextQuestion':
      return handleNextQuestion(gameId, playerId);
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

function handleJoinGame(gameId: string, playerName: string, playerId: string) {
  let game = games.get(gameId);
  
  if (!game) {
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
      lastUpdate: Date.now()
    };
    games.set(gameId, game);
  }

  // Vérifier si le nom existe déjà
  const existingPlayer = game.players.find((p: Player) => p.name === playerName);
  if (existingPlayer) {
    return NextResponse.json({ error: 'Un joueur avec ce nom existe déjà dans la partie' }, { status: 400 });
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

  return NextResponse.json({ success: true, game });
}

function handleStartGame(gameId: string, playerId: string, settings: { maxScore: number }) {
  const game = games.get(gameId);
  
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const player = game.players.find((p: Player) => p.id === playerId);
  if (!player?.isHost) {
    return NextResponse.json({ error: 'Only host can start game' }, { status: 403 });
  }

  game.gamePhase = 'playing';
  game.maxScore = settings.maxScore;
  game.currentQuestion = getRandomQuestion();
  game.roundNumber = 1;
  game.currentTurnPlayerId = game.players[0].id;
  game.lastUpdate = Date.now();

  return NextResponse.json({ success: true, game });
}

function handleSubmitGuess(gameId: string, playerId: string, value: number) {
  const game = games.get(gameId);
  
  if (!game || game.gamePhase !== 'playing') {
    return NextResponse.json({ error: 'Game not in playing state' }, { status: 400 });
  }

  const player = game.players.find((p: Player) => p.id === playerId);
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  // Vérifier que c'est le tour du joueur
  if (game.currentTurnPlayerId !== playerId) {
    return NextResponse.json({ error: 'Ce n\'est pas votre tour de jouer' }, { status: 400 });
  }

  // Vérifier que la supposition est supérieure à la précédente
  const lastGuess = game.guesses[game.guesses.length - 1];
  if (lastGuess && value <= lastGuess.value) {
    return NextResponse.json({ error: 'Votre supposition doit être supérieure à la précédente' }, { status: 400 });
  }

  const guess = {
    playerId,
    value,
    timestamp: Date.now()
  };

  game.guesses.push(guess);
  
  // Passer au joueur suivant
  const currentPlayerIndex = game.players.findIndex((p: Player) => p.id === playerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
  game.currentTurnPlayerId = game.players[nextPlayerIndex].id;
  game.lastUpdate = Date.now();

  return NextResponse.json({ success: true, game });
}

function handleIssueChallenge(gameId: string, playerId: string, targetPlayerId: string) {
  const game = games.get(gameId);
  
  if (!game || game.gamePhase !== 'playing') {
    return NextResponse.json({ error: 'Game not in playing state' }, { status: 400 });
  }

  const challenger = game.players.find((p: Player) => p.id === playerId);
  const challenged = game.players.find((p: Player) => p.id === targetPlayerId);
  
  if (!challenger || !challenged) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  // Évaluer le défi
  const lastGuess = game.guesses[game.guesses.length - 1];
  if (!lastGuess || !game.currentQuestion) {
    return NextResponse.json({ error: 'No guess to challenge' }, { status: 400 });
  }

  const isLastGuessCorrect = lastGuess.value <= game.currentQuestion.answer;
  const loser = isLastGuessCorrect ? challenger : challenged;
  
  loser.score++;

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
    return NextResponse.json({ success: true, game, roundResult, gameEnded: true, winners });
  } else {
    // Nouvelle manche - le perdant du défi commence
    game.currentQuestion = getRandomQuestion();
    game.guesses = [];
    game.roundNumber++;
    game.currentTurnPlayerId = loser.id;
    game.lastUpdate = Date.now();
    return NextResponse.json({ success: true, game, roundResult });
  }
}

function handleNextQuestion(gameId: string, playerId: string) {
  const game = games.get(gameId);
  
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const player = game.players.find((p: Player) => p.id === playerId);
  if (!player?.isHost) {
    return NextResponse.json({ error: 'Only host can start new question' }, { status: 403 });
  }

  game.currentQuestion = getRandomQuestion();
  game.guesses = [];
  game.roundNumber++;
  game.currentTurnPlayerId = game.players[0].id;
  game.lastUpdate = Date.now();

  return NextResponse.json({ success: true, game });
} 