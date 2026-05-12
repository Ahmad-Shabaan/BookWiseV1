import { Book } from './book.types';

export interface BookPermissions {
  canView: boolean;
  canBorrow: boolean;   // Role allows borrowing AND availableCopies > 0
  canReturn: boolean;   // Role allows return AND current user holds active borrow
  canEdit: boolean;   // Librarian or Admin
  canDelete: boolean;   // Admin only
  canManageCategories: boolean;  // Admin only
}

export function deriveBookPermissions(role: string, book: Book, currentUserId: string): BookPermissions {
  // Guest: canView=true, canBorrow=false, canReturn=false, canEdit=false, canDelete=false
  if (role === 'guest') {
    return {
      canView: true,
      canBorrow: false,
      canReturn: false,
      canEdit: false,
      canDelete: false,
      canManageCategories: false,
    };
  }

  // Student: canView=true, canBorrow=(availableCopies > 0), canReturn=(userHasBorrowed), canEdit=false, canDelete=false
  if (role === 'student') {
    const userHasBorrowed = book.borrowedBy === currentUserId;
    return {
      canView: true,
      canBorrow: book.availableCopies > 0,
      canReturn: userHasBorrowed,
      canEdit: false,
      canDelete: false,
      canManageCategories: false,
    };
  }

  // Librarian: canView=true, canBorrow=(availableCopies > 0), canReturn=(userHasBorrowed), canEdit=true, canDelete=false
  if (role === 'librarian') {
    const userHasBorrowed = book.borrowedBy === currentUserId;
    return {
      canView: true,
      canBorrow: book.availableCopies > 0,
      canReturn: userHasBorrowed,
      canEdit: true,
      canDelete: false,
      canManageCategories: false,
    };
  }

  // Admin: canView=true, canBorrow=(availableCopies > 0), canReturn=(userHasBorrowed), canEdit=true, canDelete=true, canManageCategories=true
  if (role === 'admin') {
    const userHasBorrowed = book.borrowedBy === currentUserId;
    return {
      canView: true,
      canBorrow: book.availableCopies > 0,
      canReturn: userHasBorrowed,
      canEdit: true,
      canDelete: true,
      canManageCategories: true,
    };
  }

  // Default case for unknown roles
  return {
    canView: false,
    canBorrow: false,
    canReturn: false,
    canEdit: false,
    canDelete: false,
    canManageCategories: false,
  };
}