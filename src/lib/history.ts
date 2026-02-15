import { SearchHistoryItem } from '@/types';

const STORAGE_KEY = 'mapengine_search_history';
const MAX_HISTORY = 10;

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToHistory(
  item: Omit<SearchHistoryItem, 'timestamp'>
): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getSearchHistory();
    // Remove duplicates (same coordinates within ~10m)
    const filtered = history.filter(
      (h) =>
        !(
          Math.abs(h.lat - item.lat) < 0.0001 &&
          Math.abs(h.lng - item.lng) < 0.0001
        )
    );
    filtered.unshift({ ...item, timestamp: Date.now() });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered.slice(0, MAX_HISTORY))
    );
  } catch {
    // localStorage might be full or unavailable
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
