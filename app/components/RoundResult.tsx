'use client';

import { RoundResult } from '../types/game';

interface RoundResultProps {
  result: RoundResult;
  onClose: () => void;
}

export default function RoundResultModal({ result, onClose }: RoundResultProps) {
  // Vérifier si c'est un cas de bonne réponse exacte (pas de défi)
  const isExactAnswer = !result.challengeIssuer && !result.challengedPlayer && !result.loser;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">
            {isExactAnswer ? 'Bonne réponse trouvée !' : 'Résultats de la manche'}
          </h2>
          <p className="text-gray-700">La bonne réponse était : <span className="font-bold text-green-600">{result.correctAnswer}</span></p>
        </div>

        <div className="space-y-6">
          {/* Suppositions */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Suppositions des joueurs</h3>
            <div className="space-y-2">
              {result.guesses.map((guess, index) => {
                const isCorrect = guess.value <= result.correctAnswer;
                const isExact = guess.value === result.correctAnswer;
                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${isExact
                        ? 'bg-yellow-50 border border-yellow-200'
                        : isCorrect
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                  >
                    <span className="font-medium">{guess.value}</span>
                    <span className={`text-sm font-semibold ${isExact
                        ? 'text-yellow-600'
                        : isCorrect
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {isExact ? '🎯 Exact !' : isCorrect ? '✓ Correct' : '✗ Trop élevé'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Résultat du défi ou bonne réponse exacte */}
          {isExactAnswer ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">🎯 Bonne réponse exacte !</h3>
              <p className="text-yellow-700">
                Un joueur a trouvé la réponse exacte !
              </p>
              <p className="text-yellow-700 mt-1">
                Il perd un point mais commence la nouvelle manche.
              </p>
            </div>
          ) : result.loser && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Défi &quot;Là t&apos;abuses!&quot;</h3>
              <p className="text-red-700">
                <span className="font-semibold">{result.challengeIssuer?.name}</span> a défié{' '}
                <span className="font-semibold">{result.challengedPlayer?.name}</span>
              </p>
              <p className="text-red-700 mt-1">
                <span className="font-semibold">{result.loser.name}</span> perd et reçoit un point !
              </p>
            </div>
          )}

          {/* Score du perdant (seulement pour les défis) */}
          {result.loser && !isExactAnswer && (
            <div className="text-center">
              <p className="text-gray-700">
                {result.loser.name} a maintenant <span className="font-bold text-red-600">{result.loser.score}</span> point(s)
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
} 