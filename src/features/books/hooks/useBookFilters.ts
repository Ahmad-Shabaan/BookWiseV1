import type { BookCategory, BookFilters, BookStatus } from '@/features/books/types/book.types';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';

export function useBookFilters(): {
  filters: BookFilters;
  setSearch: (v: string) => void;
  setCategory: (v: BookCategory | undefined) => void;
  setStatus: (v: BookStatus | undefined) => void;
  setPage: (v: number) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse URL params into filters object
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') as BookCategory | null;
  const status = searchParams.get('status') as BookStatus | null;
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Debounce search value
  const debouncedSearch = useDebounce(search, 300);

  const filters: BookFilters = {
    search: debouncedSearch,
    category: category || undefined,
    status: status || undefined,
    page,
    pageSize: 12
  };

  const setSearch = (v: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', v);
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const setCategory = (v: BookCategory | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (v) {
      newParams.set('category', v);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const setStatus = (v: BookStatus | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (v) {
      newParams.set('status', v);
    } else {
      newParams.delete('status');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const setPage = (v: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', v.toString());
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  };

  const hasActiveFilters =
    !!search ||
    !!category ||
    !!status;

  return {
    filters,
    setSearch,
    setCategory,
    setStatus,
    setPage,
    clearFilters,
    hasActiveFilters
  };
}