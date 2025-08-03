const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://la-t-abuses.vercel.app', 'https://your-domain.vercel.app'] 
      : ['http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Stockage des jeux
const games = new Map();

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

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinGame', (gameId, playerName) => {
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
        currentTurnPlayerId: null
      };
      games.set(gameId, game);
    }

    // Vérifier si le nom existe déjà
    const existingPlayer = game.players.find(p => p.name === playerName);
    if (existingPlayer) {
      socket.emit('error', 'Un joueur avec ce nom existe déjà dans la partie');
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      score: 0,
      isActive: true,
      isHost: game.players.length === 0
    };

    game.players.push(player);
    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.playerId = socket.id;

    io.to(gameId).emit('gameStateUpdate', game);
    io.to(gameId).emit('playerJoined', player);
  });

  socket.on('startGame', (settings) => {
    const gameId = socket.data.gameId;
    const game = games.get(gameId);
    
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player?.isHost) return;

    game.gamePhase = 'playing';
    game.maxScore = settings.maxScore;
    game.currentQuestion = getRandomQuestion();
    game.roundNumber = 1;
    game.currentTurnPlayerId = game.players[0].id; // Le premier joueur commence

    console.log('Game started - currentTurnPlayerId:', game.currentTurnPlayerId);
    console.log('First player:', game.players[0]);

    io.to(gameId).emit('gameStarted', settings);
    io.to(gameId).emit('newQuestion', game.currentQuestion);
    io.to(gameId).emit('gameStateUpdate', game);
  });

  socket.on('submitGuess', (value) => {
    const gameId = socket.data.gameId;
    const game = games.get(gameId);
    
    if (!game || game.gamePhase !== 'playing') return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    // Vérifier que c'est le tour du joueur
    if (game.currentTurnPlayerId !== socket.id) {
      socket.emit('error', 'Ce n\'est pas votre tour de jouer');
      return;
    }

    // Vérifier que la supposition est supérieure à la précédente
    const lastGuess = game.guesses[game.guesses.length - 1];
    if (lastGuess && value <= lastGuess.value) {
      socket.emit('error', 'Votre supposition doit être supérieure à la précédente');
      return;
    }

    const guess = {
      playerId: socket.id,
      value,
      timestamp: Date.now()
    };

    game.guesses.push(guess);
    
    // Passer au joueur suivant
    const currentPlayerIndex = game.players.findIndex(p => p.id === socket.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.currentTurnPlayerId = game.players[nextPlayerIndex].id;

    console.log('Turn changed - from:', socket.id, 'to:', game.currentTurnPlayerId);
    console.log('Current player index:', currentPlayerIndex, 'Next player index:', nextPlayerIndex);

    io.to(gameId).emit('guessSubmitted', guess);
    io.to(gameId).emit('gameStateUpdate', game);
  });

  socket.on('issueChallenge', (targetPlayerId) => {
    const gameId = socket.data.gameId;
    const game = games.get(gameId);
    
    if (!game || game.gamePhase !== 'playing') return;

    const challenger = game.players.find(p => p.id === socket.id);
    const challenged = game.players.find(p => p.id === targetPlayerId);
    
    if (!challenger || !challenged) return;

    // Évaluer le défi
    const lastGuess = game.guesses[game.guesses.length - 1];
    if (!lastGuess || !game.currentQuestion) return;

    const isLastGuessCorrect = lastGuess.value <= game.currentQuestion.answer;
    const loser = isLastGuessCorrect ? challenger : challenged;
    
    loser.score++;

    const roundResult = {
      correctAnswer: game.currentQuestion.answer,
      guesses: [...game.guesses],
      loser,
      challengeIssuer: challenger,
      challengedPlayer: challenged
    };

    io.to(gameId).emit('roundEnded', roundResult);

    // Vérifier si le jeu est terminé
    if (loser.score >= game.maxScore) {
      const winners = game.players.filter(p => p.id !== loser.id);
      game.gamePhase = 'finished';
      io.to(gameId).emit('gameEnded', winners);
    } else {
      // Nouvelle manche - le perdant du défi commence
      game.currentQuestion = getRandomQuestion();
      game.guesses = [];
      game.roundNumber++;
      game.currentTurnPlayerId = loser.id; // Le perdant commence la nouvelle manche
      io.to(gameId).emit('newQuestion', game.currentQuestion);
    }

    io.to(gameId).emit('gameStateUpdate', game);
  });

  socket.on('nextQuestion', () => {
    const gameId = socket.data.gameId;
    const game = games.get(gameId);
    
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player?.isHost) return;

    game.currentQuestion = getRandomQuestion();
    game.guesses = [];
    game.roundNumber++;
    // Le premier joueur commence la nouvelle manche
    game.currentTurnPlayerId = game.players[0].id;

    io.to(gameId).emit('newQuestion', game.currentQuestion);
    io.to(gameId).emit('gameStateUpdate', game);
  });

  socket.on('disconnect', () => {
    const gameId = socket.data.gameId;
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        game.players = game.players.filter(p => p.id !== socket.id);
        
        if (game.players.length === 0) {
          games.delete(gameId);
        } else {
          // Réassigner l'hôte si nécessaire
          if (!game.players.some(p => p.isHost)) {
            game.players[0].isHost = true;
          }
          
          // Ajuster l'index du joueur actuel si nécessaire
          if (game.currentPlayerIndex >= game.players.length) {
            game.currentPlayerIndex = 0;
          }
          
          // Ajuster le joueur actuel si celui qui se déconnecte était en train de jouer
          if (game.currentTurnPlayerId === socket.id) {
            game.currentTurnPlayerId = game.players[0].id;
          }
          
          io.to(gameId).emit('playerLeft', socket.id);
          io.to(gameId).emit('gameStateUpdate', game);
        }
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
}); 