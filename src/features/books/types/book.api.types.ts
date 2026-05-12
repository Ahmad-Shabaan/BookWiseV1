// import type { Book } from './book.types';

export interface BorrowResponse {
  id: string;
  availableCopies: number;
  status: string;
  borrowedAt: string;
  dueDate: string;
}

export interface ReturnResponse {
  id: string;
  availableCopies: number;
  status: string;
  returnedAt: string;
}

export type BooksApiErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';