import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Book } from '@/features/books/types/book.types';
import { deriveBookPermissions } from '@/features/books/types/book.permissions';
import { useMemo } from 'react';

export function useBookPermissions(book: Book) {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        canView: false,
        canBorrow: false,
        canReturn: false,
        canEdit: false,
        canDelete: false,
        canManageCategories: false,
      };
    }

    return deriveBookPermissions(user.role, book, user.id);
  }, [book, user]);
}