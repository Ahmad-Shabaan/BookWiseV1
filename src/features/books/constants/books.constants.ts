export const BOOKS_PAGE_SIZE = 12;
export const BOOKS_DEBOUNCE_MS = 300;
export const BOOKS_STALE_TIME = 60_000;
export const BOOKS_GC_TIME = 300_000;

export const BOOK_KEYS = {
  all: () => ['books'] as const,
  list: (filters: any) => ['books', 'list', filters] as const,
  detail: (id: string) => ['books', 'detail', id] as const,
};