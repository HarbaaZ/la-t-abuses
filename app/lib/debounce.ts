// Système de debouncing pour éviter les appels multiples
const debounceTimers = new Map<string, NodeJS.Timeout>();

export function debounce<T extends (...args: unknown[]) => unknown>(
  key: string,
  func: T,
  delay: number = 1000
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    // Annuler le timer précédent
    const existingTimer = debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Créer un nouveau timer
    const timer = setTimeout(() => {
      func(...args);
      debounceTimers.delete(key);
    }, delay);

    debounceTimers.set(key, timer);
  };
}

export function clearDebounce(key: string): void {
  const timer = debounceTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    debounceTimers.delete(key);
  }
}

export function clearAllDebounce(): void {
  for (const timer of debounceTimers.values()) {
    clearTimeout(timer);
  }
  debounceTimers.clear();
} 