'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  clearRoundResult as clearRoundResultAction,
  getGameState,
  issueChallenge as issueChallengeAction,
  joinGame as joinGameAction,
  startGame as startGameAction,
  submitGuess as submitGuessAction
} from './actions/game';
import RoundResultModal from './components/RoundResult';
import { GameSettings, GameState, Player, RoundResult } from './types/game';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    maxScore: 3,
    gameMode: 'classic'
  });
  const [playerId, setPlayerId] = useState('');
  const [lastUpdate, setLastUpdate] = useState(0);
  const [lastRoundNumber, setLastRoundNumber] = useState(0);
  const [lastGuessesLength, setLastGuessesLength] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Générer un ID unique pour le joueur
  useEffect(() => {
    if (!playerId) {
      setPlayerId(Math.random().toString(36).substr(2, 9));
    }
  }, [playerId]);

  // Polling pour mettre à jour l'état du jeu
  useEffect(() => {
    if (!gameId || !isConnected) return;

    const pollGameState = async () => {
      try {
        const game = await getGameState(gameId);
        if (game && game.lastUpdate > lastUpdate) {
          // Détecter si un défi a été lancé ou une bonne réponse trouvée
          const roundChanged = game.roundNumber > lastRoundNumber;
          const guessesReset = game.guesses.length < lastGuessesLength;

          setGameState(game);
          setLastUpdate(game.lastUpdate);
          setLastRoundNumber(game.roundNumber);
          setLastGuessesLength(game.guesses.length);

          // Si la manche a changé ou les suppositions ont été réinitialisées,
          // c'est probablement dû à un défi ou une bonne réponse
          if ((roundChanged || guessesReset) && game.lastUpdate > lastUpdate + 1000) {
            // Attendre un peu pour s'assurer que le serveur a traité l'action
            setTimeout(async () => {
              try {
                const currentGame = await getGameState(gameId);
                // Si le jeu a un roundResult stocké, l'afficher à tous les joueurs
                if (currentGame?.lastRoundResult) {
                  setRoundResult(currentGame.lastRoundResult);
                }
              } catch (error) {
                console.error('Error fetching round result:', error);
              }
            }, 500);
          }

          // Vérifier aussi si le jeu a un lastRoundResult directement
          if (game.lastRoundResult && !roundResult) {
            // Vérifier que ce n'est pas le même résultat que précédemment
            const currentResultHash = JSON.stringify(game.lastRoundResult);
            const lastResultHash = localStorage.getItem(`lastResult_${gameId}`);

            if (currentResultHash !== lastResultHash) {
              setRoundResult(game.lastRoundResult);
              // Nettoyer le lastRoundResult dans l'état local pour éviter qu'il se réaffiche
              setGameState({ ...game, lastRoundResult: null });
              // Stocker le hash du résultat pour éviter les doublons
              localStorage.setItem(`lastResult_${gameId}`, currentResultHash);
            }
          }
        } else if (!game) {
          // Le jeu n'existe plus
          console.log('Game not found during polling, redirecting to join screen...');
          alert('La partie a été perdue. Veuillez rejoindre une nouvelle partie.');
          setIsConnected(false);
          setGameState(null);
        }
      } catch (error) {
        console.error('Error polling game state:', error);
        // En cas d'erreur de réseau, ne pas déconnecter immédiatement
        // Attendre quelques tentatives avant de considérer le jeu comme perdu
      }
    };

    const interval = setInterval(pollGameState, 500); // Poll toutes les 500ms
    return () => clearInterval(interval);
  }, [gameId, isConnected, lastUpdate, lastRoundNumber, lastGuessesLength]);

  const joinGame = async () => {
    if (!playerName.trim() || !gameId.trim()) return;

    startTransition(async () => {
      try {
        const result = await joinGameAction(gameId, playerName, playerId);
        setGameState(result.game);
        setLastUpdate(result.game.lastUpdate);
        setIsConnected(true);
      } catch (error) {
        console.error('Error joining game:', error);
        alert(error instanceof Error ? error.message : 'Erreur lors de la connexion au jeu');
      }
    });
  };

  const startGame = async () => {
    if (!gameId || !playerId) return;

    startTransition(async () => {
      try {
        const result = await startGameAction(gameId, playerId, gameSettings);
        setGameState(result.game);
        setLastUpdate(result.game.lastUpdate);
        console.log('Game started successfully');
      } catch (error) {
        console.error('Error starting game:', error);
        alert(error instanceof Error ? error.message : 'Erreur lors du démarrage du jeu');
      }
    });
  };

  const submitGuess = async () => {
    if (!gameId || !playerId || !currentGuess) return;

    // Vérifier que l'état local est cohérent
    if (!gameState || gameState.gamePhase !== 'playing') {
      alert('Le jeu n\'est pas en cours. Veuillez attendre.');
      return;
    }

    const value = parseInt(currentGuess);
    if (isNaN(value) || value <= 0) {
      alert('Veuillez entrer un nombre valide');
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitGuessAction(gameId, playerId, value);
        setGameState(result.game);
        setLastUpdate(result.game.lastUpdate);
        setCurrentGuess('');

        // Afficher les résultats directement pour le joueur qui lance l'action
        if (result.exactAnswerFound) {
          if (result.gameEnded) {
            alert(`${result.answerFinder.name} a trouvé la bonne réponse ! Il gagne la partie avec un score de ${result.answerFinder.score} !`);
          } else {
            // Afficher le modal avec les résultats
            if (result.roundResult) {
              setRoundResult(result.roundResult);
            }
          }
        }
      } catch (error) {
        console.error('Error submitting guess:', error);
        alert(error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la supposition');
      }
    });
  };

  const issueChallenge = async (targetPlayerId: string) => {
    if (!gameId || !playerId) return;

    // Vérifier que l'état local est cohérent
    if (!gameState || gameState.gamePhase !== 'playing') {
      alert('Le jeu n\'est pas en cours. Veuillez attendre.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await issueChallengeAction(gameId, playerId, targetPlayerId);
        setGameState(result.game);
        setLastUpdate(result.game.lastUpdate);

        // Afficher les résultats directement pour le joueur qui lance l'action
        if (result.roundResult) {
          setRoundResult(result.roundResult);
        }

        if (result.gameEnded) {
          alert(`Partie terminée ! ${result.winners.map((w: Player) => w.name).join(', ')} ont gagné !`);
        }
      } catch (error) {
        console.error('Error issuing challenge:', error);
        alert(error instanceof Error ? error.message : 'Erreur lors du défi');
      }
    });
  };

  const closeRoundResult = () => {
    setRoundResult(null);
    // Nettoyer le lastRoundResult dans l'état du jeu
    if (gameState) {
      setGameState({ ...gameState, lastRoundResult: null });
    }

    // Nettoyer le localStorage pour permettre l'affichage de nouveaux résultats
    if (gameId) {
      localStorage.removeItem(`lastResult_${gameId}`);
    }

    // Nettoyer le lastRoundResult côté serveur
    if (gameId) {
      startTransition(async () => {
        try {
          await clearRoundResultAction(gameId);
        } catch (error) {
          console.error('Error clearing round result:', error);
        }
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 mb-2">Là t&apos;abuses!</h1>
            <p className="text-gray-700">Le jeu d&apos;apéro qui abuse pas mal !</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Votre nom
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Entrez votre nom"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Code de la partie
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-base"
                placeholder="Entrez le code de la partie"
                style={{ fontSize: '16px' }}
              />
            </div>

            <button
              onClick={joinGame}
              disabled={!playerName.trim() || !gameId.trim()}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Rejoindre la partie
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la partie...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost;
  const isMyTurn = gameState.currentTurnPlayerId === playerId;
  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">Là t&apos;abuses!</h1>
              <p className="text-gray-700">Partie #{gameState.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Manche {gameState.roundNumber}</p>
              <p className="text-sm text-gray-500">Score max: {gameState.maxScore}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Joueurs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Joueurs ({gameState.players.length})</h2>
              <div className="space-y-3">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${player.id === playerId ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                      } ${player.id === gameState.currentTurnPlayerId ? 'ring-2 ring-green-500' : ''
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{player.name}</span>
                      {player.isHost && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Hôte</span>
                      )}
                      {player.id === gameState.currentTurnPlayerId && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded animate-pulse">À jouer</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-red-600">{player.score} points</div>
                      {player.isActive && (
                        <div className="text-xs text-green-600">En jeu</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zone de jeu principale */}
          <div className="lg:col-span-2">
            {gameState.gamePhase === 'waiting' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">En attente des joueurs</h2>
                <p className="text-gray-700 mb-6">
                  Partagez le code <span className="font-mono bg-gray-100 px-2 py-1 rounded">{gameState.id}</span> avec vos amis
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Vos amis peuvent rejoindre depuis n&apos;importe quel navigateur !
                </p>
                {isHost && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Score maximum pour perdre
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        max="10"
                        value={gameSettings.maxScore}
                        onChange={(e) => setGameSettings({ ...gameSettings, maxScore: parseInt(e.target.value) })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 text-base"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <button
                      onClick={startGame}
                      disabled={gameState.players.length < 2}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Commencer la partie
                    </button>
                  </div>
                )}
              </div>
            )}

            {gameState.gamePhase === 'playing' && gameState.currentQuestion && (
              <div className="space-y-6">
                {/* Indicateur de tour */}
                {currentTurnPlayer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                      C&apos;est au tour de <span className="font-bold">{currentTurnPlayer.name}</span>
                    </p>
                    {isMyTurn && (
                      <p className="text-sm text-green-600 mt-1">C&apos;est votre tour !</p>
                    )}
                  </div>
                )}

                {/* Question actuelle */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Question actuelle</h2>
                  <p className="text-lg text-gray-900 mb-4">{gameState.currentQuestion.text}</p>
                  <div className="text-sm text-gray-600">Catégorie: {gameState.currentQuestion.category}</div>
                </div>

                {/* Suppositions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Suppositions</h3>
                  <div className="space-y-2 mb-4">
                    {gameState.guesses.map((guess, index) => {
                      const player = gameState.players.find(p => p.id === guess.playerId);
                      return (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-900">{player?.name}</span>
                          <span className="text-lg font-bold text-indigo-600">{guess.value}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Zone de saisie */}
                  {currentPlayer && (
                    <div className="space-y-4">
                      {isMyTurn ? (
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={currentGuess}
                            onChange={(e) => setCurrentGuess(e.target.value)}
                            placeholder="Votre supposition"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 text-base"
                            style={{ fontSize: '16px' }}
                          />
                          <button
                            onClick={submitGuess}
                            disabled={!currentGuess}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            Deviner
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600">En attente du tour de {currentTurnPlayer?.name}...</p>
                        </div>
                      )}

                      {/* Boutons de défi */}
                      {gameState.guesses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {gameState.players.map((player) => {
                            if (player.id === playerId) return null;
                            const lastGuess = gameState.guesses[gameState.guesses.length - 1];
                            if (lastGuess && lastGuess.playerId === player.id) {
                              return (
                                <button
                                  key={player.id}
                                  onClick={() => issueChallenge(player.id)}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                  Là t&apos;abuses! ({player.name})
                                </button>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState.gamePhase === 'finished' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Partie terminée !</h2>
                <p className="text-gray-700 mb-6">La partie est finie. Merci d&apos;avoir joué !</p>
                {isHost && (
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Nouvelle partie
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal des résultats de manche */}
      {roundResult && (
        <RoundResultModal
          result={roundResult}
          onClose={closeRoundResult}
        />
      )}
    </div>
  );
}
