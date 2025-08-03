import { Question } from '../types/game';

export const questions: Question[] = [
  {
    id: '1',
    text: 'Combien de pays composent l\'Union Européenne en 2024 ?',
    answer: 27,
    category: 'géographie'
  },
  {
    id: '2',
    text: 'Combien d\'os compte le corps humain adulte ?',
    answer: 206,
    category: 'anatomie'
  },
  {
    id: '3',
    text: 'Combien de joueurs composent une équipe de football sur le terrain ?',
    answer: 11,
    category: 'sport'
  },
  {
    id: '4',
    text: 'Combien de lettres compte l\'alphabet français ?',
    answer: 26,
    category: 'langue'
  },
  {
    id: '5',
    text: 'Combien de planètes compte notre système solaire ?',
    answer: 8,
    category: 'astronomie'
  },
  {
    id: '6',
    text: 'Combien de jours compte une année bissextile ?',
    answer: 366,
    category: 'temps'
  },
  {
    id: '7',
    text: 'Combien de couleurs compte l\'arc-en-ciel ?',
    answer: 7,
    category: 'nature'
  },
  {
    id: '8',
    text: 'Combien de doigts a un être humain ?',
    answer: 10,
    category: 'anatomie'
  },
  {
    id: '9',
    text: 'Combien de côtés a un hexagone ?',
    answer: 6,
    category: 'géométrie'
  },
  {
    id: '10',
    text: 'Combien de minutes compte une heure ?',
    answer: 60,
    category: 'temps'
  },
  {
    id: '11',
    text: 'Combien de joueurs composent une équipe de basket-ball sur le terrain ?',
    answer: 5,
    category: 'sport'
  },
  {
    id: '12',
    text: 'Combien de continents compte notre planète ?',
    answer: 7,
    category: 'géographie'
  },
  {
    id: '13',
    text: 'Combien de notes de musique y a-t-il dans une octave ?',
    answer: 8,
    category: 'musique'
  },
  {
    id: '14',
    text: 'Combien de joueurs composent une équipe de volley-ball sur le terrain ?',
    answer: 6,
    category: 'sport'
  },
  {
    id: '15',
    text: 'Combien de jours compte le mois de février en année normale ?',
    answer: 28,
    category: 'temps'
  },
  {
    id: '16',
    text: 'Combien de côtés a un pentagone ?',
    answer: 5,
    category: 'géométrie'
  },
  {
    id: '17',
    text: 'Combien de joueurs composent une équipe de handball sur le terrain ?',
    answer: 7,
    category: 'sport'
  },
  {
    id: '18',
    text: 'Combien de secondes compte une minute ?',
    answer: 60,
    category: 'temps'
  },
  {
    id: '19',
    text: 'Combien de côtés a un carré ?',
    answer: 4,
    category: 'géométrie'
  },
  {
    id: '20',
    text: 'Combien de joueurs composent une équipe de rugby à XV sur le terrain ?',
    answer: 15,
    category: 'sport'
  },
  {
    id: '21',
    text: 'Combien de jours compte le mois d\'avril ?',
    answer: 30,
    category: 'temps'
  },
  {
    id: '22',
    text: 'Combien de côtés a un triangle ?',
    answer: 3,
    category: 'géométrie'
  },
  {
    id: '23',
    text: 'Combien de joueurs composent une équipe de hockey sur glace sur le terrain ?',
    answer: 6,
    category: 'sport'
  },
  {
    id: '24',
    text: 'Combien de jours compte le mois de janvier ?',
    answer: 31,
    category: 'temps'
  },
  {
    id: '25',
    text: 'Combien de côtés a un octogone ?',
    answer: 8,
    category: 'géométrie'
  }
];

export function getRandomQuestion(): Question {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter(q => q.category === category);
} 