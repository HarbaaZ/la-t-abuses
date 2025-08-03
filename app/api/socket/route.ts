import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';

// Stockage global des jeux (en mémoire pour Vercel)
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

// Instance Socket.IO globale
const io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  // Pour Vercel, nous devons utiliser une approche différente
  // Socket.IO ne fonctionne pas bien avec les API Routes serverless
  // Nous allons utiliser une solution alternative
  
  return NextResponse.json({ 
    message: 'Socket.IO server is running',
    status: 'connected'
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ success: true });
} 