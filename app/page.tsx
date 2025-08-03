'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import RoundResultModal from './components/RoundResult';
import { GameSettings, GameState, Guess, Question, RoundResult } from './types/game';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(true);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    maxScore: 3,
    gameMode: 'classic'
  });

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('gameStateUpdate', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('newQuestion', (question: Question) => {
      console.log('New question:', question);
    });

    newSocket.on('guessSubmitted', (guess: Guess) => {
      console.log('Guess submitted:', guess);
    });

    newSocket.on('roundEnded', (results: RoundResult) => {
      console.log('Round ended:', results);
      setRoundResult(results);
    });

    newSocket.on('gameEnded', (winners) => {
      console.log('Game ended, winners:', winners);
    });

    newSocket.on('error', (message: string) => {
      alert(message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinGame = () => {
    if (!socket || !playerName.trim() || !gameId.trim()) return;

    socket.emit('joinGame', gameId, playerName);
    setShowJoinForm(false);
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('startGame', gameSettings);
  };

  const submitGuess = () => {
    if (!socket || !currentGuess) return;

    const value = parseInt(currentGuess);
    if (isNaN(value) || value <= 0) {
      alert('Veuillez entrer un nombre valide');
      return;
    }

    socket.emit('submitGuess', value);
    setCurrentGuess('');
  };

  const issueChallenge = (targetPlayerId: string) => {
    if (!socket) return;
    socket.emit('issueChallenge', targetPlayerId);
  };

  const nextQuestion = () => {
    if (!socket) return;
    socket.emit('nextQuestion');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion au serveur...</p>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Code de la partie
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Entrez le code de la partie"
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

  const currentPlayer = gameState.players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost;
  const isMyTurn = gameState.currentTurnPlayerId === socket?.id;
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
                    className={`flex justify-between items-center p-3 rounded-lg ${player.id === socket?.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
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
                        min="1"
                        max="10"
                        value={gameSettings.maxScore}
                        onChange={(e) => setGameSettings({ ...gameSettings, maxScore: parseInt(e.target.value) })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
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
                      {isMyTurn && gameState.currentTurnPlayerId ? (
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={currentGuess}
                            onChange={(e) => setCurrentGuess(e.target.value)}
                            placeholder="Votre supposition"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
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
                          {gameState.currentTurnPlayerId && currentTurnPlayer ? (
                            <p className="text-gray-600">En attente du tour de {currentTurnPlayer.name}...</p>
                          ) : (
                            <p className="text-gray-600">En attente du début de la partie...</p>
                          )}
                        </div>
                      )}

                      {/* Boutons de défi */}
                      {gameState.guesses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {gameState.players.map((player) => {
                            if (player.id === socket?.id) return null;
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
          onClose={() => setRoundResult(null)}
        />
      )}
    </div>
  );
}
