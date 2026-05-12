import { BOOK_KEYS } from '@/features/books/constants/books.constants';
import { BOOKS_GC_TIME, BOOKS_STALE_TIME } from '@/features/books/constants/books.constants';
import { fetchBookById, fetchBooks } from '@/features/books/services/books.api';
import type { Book, BookFilters, PaginatedBooks } from '@/features/books/types/book.types';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

export function useBooks(filters: BookFilters): UseQueryResult<PaginatedBooks, Error> {
  return useQuery<PaginatedBooks, Error>({
    queryKey: BOOK_KEYS.list(filters),
    queryFn: () => fetchBooks(filters),
    staleTime: BOOKS_STALE_TIME,
    gcTime: BOOKS_GC_TIME,
  });
}

export function useBookDetail(id: string) {
  return useQuery<Book, Error>({
    queryKey: BOOK_KEYS.detail(id),
    queryFn: () => fetchBookById(id),
    staleTime: BOOKS_STALE_TIME,
    gcTime: BOOKS_GC_TIME,
  });
}