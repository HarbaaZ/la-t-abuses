// Système de polling optimisé pour réduire les appels réseau
const pollingCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 1000; // 1 seconde de cache

export function shouldPoll(gameId: string, lastUpdate: number): boolean {
  const cached = pollingCache.get(gameId);
  const now = Date.now();
  
  // Si on a un cache récent, ne pas poller
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return false;
  }
  
  // Si le lastUpdate n'a pas changé depuis longtemps, poller moins souvent
  const timeSinceLastUpdate = now - lastUpdate;
  if (timeSinceLastUpdate > 30000) { // Plus de 30 secondes
    return Math.random() < 0.3; // 30% de chance de poller
  }
  
  return true;
}

export function updateCache(gameId: string, data: unknown): void {
  pollingCache.set(gameId, { data, timestamp: Date.now() });
}

export function clearCache(gameId?: string): void {
  if (gameId) {
    pollingCache.delete(gameId);
  } else {
    pollingCache.clear();
  }
}

// Nettoyer le cache toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pollingCache.entries()) {
    if (now - value.timestamp > 300000) { // 5 minutes
      pollingCache.delete(key);
    }
  }
}, 300000); 