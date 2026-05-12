import axiosClient from '@/shared/api/axiosClient';
import {
  type Book,
  type BookFilters,
  type PaginatedBooks,
  type BorrowResponse,
  type ReturnResponse,
  // type BooksApiErrorCode
} from '@/features/books/types/book.types';

// All responses are wrapped in { success: true, data: T } — unwrap data before returning
// Each function should throw if response.data.success === false

export async function fetchBooks(filters: BookFilters): Promise<PaginatedBooks> {
  const response = await axiosClient.get('/api/books', { params: filters });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}

export async function fetchBookById(id: string): Promise<Book> {
  const response = await axiosClient.get(`/api/books/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}

export async function borrowBook(id: string): Promise<BorrowResponse> {
  const response = await axiosClient.post(`/api/books/${id}/borrow`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}

export async function returnBook(id: string): Promise<ReturnResponse> {
  const response = await axiosClient.post(`/api/books/${id}/return`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}

export async function createBook(payload: Omit<Book, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Book> {
  const response = await axiosClient.post('/api/books', payload);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}

export async function updateBook(id: string, payload: Partial<Book>): Promise<Book> {
  const response = await axiosClient.put(`/api/books/${id}`, payload);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}

export async function deleteBook(id: string): Promise<{ id: string }> {
  const response = await axiosClient.delete(`/api/books/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Unknown error');
  }
  return response.data.data;
}