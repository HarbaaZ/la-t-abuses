export interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
  isHost: boolean;
}

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  currentTurnPlayerId: string | null;
  currentQuestion: Question | null;
  gamePhase: 'waiting' | 'playing' | 'finished';
  guesses: Guess[];
  maxScore: number;
  roundNumber: number;
  lastUpdate: number;
  lastRoundResult?: RoundResult | null;
  usedQuestions: string[]; // IDs des questions déjà utilisées dans cette partie
  gameQuestions: Question[]; // Questions générées par IA pour cette partie
}

export interface Question {
  id: string;
  text: string;
  answer: number;
  category: string;
}

export interface Guess {
  playerId: string;
  value: number;
  timestamp: number;
}

export interface GameSettings {
  maxScore: number;
  gameMode: 'classic' | 'ctya' | 'pilepoil'; // classic, c'est toi qui abuses, pile-poil
}

export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  gameStarted: (settings: GameSettings) => void;
  newQuestion: (question: Question) => void;
  guessSubmitted: (guess: Guess) => void;
  challengeIssued: (challengerId: string, challengedId: string) => void;
  roundEnded: (results: RoundResult) => void;
  gameEnded: (winner: Player[]) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  joinGame: (gameId: string, playerName: string) => void;
  leaveGame: () => void;
  startGame: (settings: GameSettings) => void;
  submitGuess: (value: number) => void;
  issueChallenge: (targetPlayerId: string) => void;
  nextQuestion: () => void;
}

export interface RoundResult {
  correctAnswer: number;
  guesses: Guess[];
  loser: Player | null;
  challengeIssuer: Player | null;
  challengedPlayer: Player | null;
} 