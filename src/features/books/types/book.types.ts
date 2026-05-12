export const BookCategory = {
  Fiction: "fiction",
  Science: "science",
  History: "history",
  Technology: "technology",
  Arts: "arts",
  Reference: "reference",
} as const;

export type BookCategory = typeof BookCategory[keyof typeof BookCategory];

export const BookStatus = {
  Available: "available",
  Borrowed: "borrowed",
  Reserved: "reserved",
} as const;

export type BookStatus = typeof BookStatus[keyof typeof BookStatus];

export interface Book {
  // Identity
  id: string; // UUID, server-generated
  isbn: string; // Normalized: digits + hyphens stripped, stored as digits only

  // Descriptive
  title: string; // Max 255 characters; truncated at 100 chars in UI with tooltip
  author: string; // Max 255 characters
  category: BookCategory;
  publishedYear: number; // 4-digit year, e.g. 1965
  coverImage?: string; // URL; optional — UI falls back to placeholder if absent/broken

  // Availability (read-only from front end)
  totalCopies: number; // >= 1
  availableCopies: number; // 0 <= availableCopies <= totalCopies
  status: BookStatus; // Derived by API; front end treats as read-only

  // Sensitive — role-restricted
  borrowedBy?: string; // User ID of current borrower; present only in Librarian/Admin responses on detail page

  // Audit
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface BookFilters {
  search?: string; // Free text; matches title OR author; debounced 300ms before API call
  category?: BookCategory; // Single category filter
  status?: BookStatus; // Optional availability filter
  page: number; // 1-indexed; defaults to 1
  pageSize: number; // Fixed at 12 for Phase 1
}

export interface PaginatedBooks {
  data: Book[];
  total: number; // Total matching records (for pagination UI)
  page: number; // Current page (1-indexed)
  pageSize: number; // Items per page (12)
  totalPages: number; // Math.ceil(total / pageSize)
}

export interface BorrowResponse {
  id: string;
  availableCopies: number;
  status: BookStatus;
  borrowedAt: string;
  dueDate: string;
}

export interface ReturnResponse {
  id: string;
  availableCopies: number;
  status: BookStatus;
  returnedAt: string;
}

export type BooksApiErrorCode = 
  | "NOT_FOUND" 
  | "FORBIDDEN" 
  | "VALIDATION_ERROR" 
  | "RATE_LIMITED" 
  | "CONFLICT" 
  | "INTERNAL_ERROR";