import { GameState } from '../types/game';

// Utiliser Vercel KV en production, fallback en développement
const isProduction = process.env.NODE_ENV === 'production' && process.env.KV_URL;

const GAME_PREFIX = 'game:';
const GAME_TTL = 2 * 60 * 60; // 2 heures en secondes

// Fallback pour le développement local
const games = new Map<string, GameState>();

export async function getGame(gameId: string): Promise<GameState | null> {
  if (isProduction) {
    try {
      const { kv } = await import('@vercel/kv');
      const game = await kv.get<GameState>(`${GAME_PREFIX}${gameId}`);
      return game;
    } catch (error) {
      console.error('Error getting game from KV:', error);
      return null;
    }
  } else {
    return games.get(gameId) || null;
  }
}

export async function setGame(gameId: string, game: GameState): Promise<void> {
  if (isProduction) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.setex(`${GAME_PREFIX}${gameId}`, GAME_TTL, game);
    } catch (error) {
      console.error('Error setting game in KV:', error);
      throw error;
    }
  } else {
    games.set(gameId, game);
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  if (isProduction) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.del(`${GAME_PREFIX}${gameId}`);
    } catch (error) {
      console.error('Error deleting game from KV:', error);
    }
  } else {
    games.delete(gameId);
  }
}

export async function getAllGameIds(): Promise<string[]> {
  if (isProduction) {
    try {
      const { kv } = await import('@vercel/kv');
      const keys = await kv.keys(`${GAME_PREFIX}*`);
      return keys.map((key: string) => key.replace(GAME_PREFIX, ''));
    } catch (error) {
      console.error('Error getting all game IDs from KV:', error);
      return [];
    }
  } else {
    return Array.from(games.keys());
  }
}

export async function cleanupOldGames(): Promise<void> {
  if (isProduction) {
    try {
      const gameIds = await getAllGameIds();
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      
      for (const gameId of gameIds) {
        const game = await getGame(gameId);
        if (game && game.lastUpdate < twoHoursAgo) {
          console.log(`Cleaning up old game: ${gameId}`);
          await deleteGame(gameId);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old games:', error);
    }
  } else {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    for (const [gameId, game] of games.entries()) {
      if (game.lastUpdate < twoHoursAgo) {
        console.log(`Cleaning up old game: ${gameId}`);
        games.delete(gameId);
      }
    }
  }
} 