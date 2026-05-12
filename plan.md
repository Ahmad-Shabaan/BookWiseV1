
# 📦 Books Feature — Optimized SPECKIT Plan

## 🧭 Overview

This plan defines how the **Books feature** in the Library Management System is structured using SPECKIT principles, combining the best practices from iterative planning.

- Specs are stored inside the feature folder
- Stitch is used as the **UI source of truth**
- Each phase = a spec file
- Implementation follows specs directly
- Error, accessibility, and performance are first-class concerns

---

## 🗂️ Folder Structure

```
/src/features/books
  /specs
    01-books-core.spec.ts
    02-books-model.spec.ts
    03-books-api.spec.ts
    04-books-ui.spec.ts
    05-books-interactions.spec.ts
    06-books-errors-edge.spec.ts
    07-books-a11y-performance.spec.ts
  /components
    BookCard.tsx
    BookGrid.tsx
    BookFilters.tsx
    BookSkeleton.tsx
    BookEmptyState.tsx
    BookErrorBoundary.tsx
  /pages
    BooksPage.tsx
  /hooks
    useBooks.ts
    useBookFilters.ts
    useBookPermissions.ts
  /services
    books.api.ts
  /types
    book.types.ts
    book.permissions.ts
    book.api.types.ts
  /constants
    books.constants.ts
  /design
    stitch.books.json
  /tests
    BookCard.test.tsx
    BookGrid.test.tsx
    useBooks.test.ts
    useBookFilters.test.ts
    books.api.test.ts
    books.permissions.test.ts
```

---

## 🧩 Phase 1 — Core Feature Spec

📄 `01-books-core.spec.ts`

### Goal

Define system behavior, roles, and permissions. No UI or API details.

### Responsibilities

- Display library books with search and filter capabilities
- Search by title or author
- Filter by category
- Support pagination with URL-driven state
- Support four distinct roles with granular permissions
- Navigate to book detail page
- Handle all async states: loading, error, empty, success

### Role Matrix

| Role      | View Books | Borrow | Return | Add/Edit | Delete | Manage Categories |
|-----------|------------|--------|--------|----------|--------|-------------------|
| Guest     | ✅         | ❌     | ❌     | ❌       | ❌     | ❌                |
| Student   | ✅         | ✅     | ✅     | ❌       | ❌     | ❌                |
| Librarian | ✅         | ✅     | ✅     | ✅       | ❌     | ❌                |
| Admin     | ✅         | ✅     | ✅     | ✅       | ✅     | ✅                |

### Core Constraints

- Filters must be reflected in URL query string
- Pagination state must survive browser back button
- All async states must be handled: loading, error, empty, success
- Borrow action requires `availableCopies > 0`

---

## 🧱 Phase 2 — Data Model Spec

📄 `02-books-model.spec.ts`

### Enums

```ts
enum BookCategory {
  Fiction = "fiction",
  Science = "science",
  History = "history",
  Technology = "technology",
  Arts = "arts",
  Reference = "reference"
}

enum BookStatus {
  Available = "available",
  Borrowed = "borrowed",
  Reserved = "reserved"
}
```

### Book Entity

```ts
interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: BookCategory
  status: BookStatus
  publishedYear: number
  totalCopies: number
  availableCopies: number
  borrowedBy?: string          // Admin/Librarian only
  coverImage?: string
  createdAt: string
  updatedAt: string
}
```

### Key Model Rules

- `availableCopies` drives the status badge — not a separate stored field
- `status` is derived: `availableCopies > 0 ? Available : Borrowed`
- `borrowedBy` is only visible to Librarian and Admin roles
- Each book has exactly one category

### Pagination Type

```ts
interface PaginatedBooks {
  data: Book[]
  total: number
  page: number
  pageSize: number            // Fixed at 12 (3×4 grid on desktop)
  totalPages: number
}
```

### Filter Types

```ts
interface BookFilters {
  search?: string
  category?: BookCategory
  status?: BookStatus
  page: number
  pageSize: number
}
```

---

## 🔌 Phase 3 — API Contract Spec

📄 `03-books-api.spec.ts`

### Base URL

```
/api/books
```

### Endpoints

| Method   | Path                  | Roles                  | Description              |
|----------|-----------------------|------------------------|--------------------------|
| `GET`    | `/books`              | All                    | List books (paginated)   |
| `GET`    | `/books/:id`          | All                    | Get single book          |
| `POST`   | `/books`              | Librarian, Admin       | Create new book          |
| `PUT`    | `/books/:id`          | Librarian, Admin       | Update book              |
| `DELETE` | `/books/:id`          | Admin                  | Delete book              |
| `POST`   | `/books/:id/borrow`   | Student, Librarian, Admin | Borrow a book         |
| `POST`   | `/books/:id/return`   | Student, Librarian, Admin | Return a borrowed book |

### Query Parameters (GET /books)

| Parameter  | Type     | Default | Description                        |
|------------|----------|---------|------------------------------------|
| `search`   | `string` | `""`    | Search by title or author          |
| `category` | `string` | —       | Filter by category                 |
| `status`   | `string` | —       | Filter by availability             |
| `page`     | `number` | `1`     | Page number                        |
| `pageSize` | `number` | `12`    | Items per page                     |

### Standard Response Shape

**Success Response:**
```ts
{
  success: true
  data: PaginatedBooks | Book
  meta: {
    requestId: string
    timestamp: string
  }
}
```

**Error Response:**
```ts
{
  success: false
  error: {
    code: "NOT_FOUND" | "FORBIDDEN" | "VALIDATION_ERROR" | "RATE_LIMITED" | "INTERNAL_ERROR"
    message: string
    field?: string              // Present for validation errors
  }
}
```

### API Rules

- **Rate limiting:** 100 requests per minute per user
- **Caching:** `Cache-Control: max-age=60, stale-while-revalidate=300` on all GET responses
- **401 Unauthorized:** Redirect to login page
- **403 Forbidden:** Display permission toast notification
- **429 Rate Limited:** Auto-retry after 5 seconds with user notification
- **Borrow endpoint:** Decrements `availableCopies` atomically
- **Return endpoint:** Increments `availableCopies` atomically

---

## 🎨 Phase 4 — UI Spec (Stitch-Driven)

📄 `04-books-ui.spec.ts`

### UI Source of Truth

- Stitch design file: `/design/stitch.books.json`
- Stitch project reference: `books-page-v1`

### Component Hierarchy

```
BooksPage
├── BookFilters
│   ├── SearchInput
│   ├── CategoryDropdown
│   └── ClearFiltersButton
├── BookErrorBoundary
│   └── BookGrid
│       └── BookCard[]
└── Pagination
```

### Layout & Responsive Rules (from Stitch)

| Breakpoint | Grid Columns | Card Width | Side Padding |
|------------|--------------|------------|--------------|
| Mobile     | 1 column     | Full width | 16px         |
| Tablet     | 2 columns    | 344px      | 24px         |
| Desktop    | 3–4 columns  | 320px      | 32px         |

### BookCard Component

**Always visible fields:**
- Cover image (with placeholder on error/broken link)
- Title
- Author
- Category tag
- Status badge (with text, never color alone)

**Role-based action buttons:**

| Role      | Action Button                                      |
|-----------|---------------------------------------------------|
| Guest     | "Login to Borrow" (disabled, links to login)      |
| Student   | "Borrow" (disabled if `availableCopies === 0`)    |
| Librarian | "Borrow" + "Edit"                                  |
| Admin     | "Borrow" + "Edit" + "Delete"                       |

### Design Tokens (from Stitch)

**Status Badge Colors:**
- Available → `background: green-100`, `text: green-700`, `label: "Available"`
- Borrowed → `background: red-100`, `text: red-700`, `label: "Borrowed"`
- Reserved → `background: yellow-100`, `text: yellow-700`, `label: "Reserved"`

**Skeleton Loading:**
- Must match exact card dimensions (width, height, padding)
- Prevents Cumulative Layout Shift (CLS)
- Show 12 skeleton cards (same as pageSize) during initial load

**Empty State:**
- Illustration + "No books found" message
- If search/filter active: "Try different search terms or filters"
- If no active filters: "No books available yet"

**Cover Image Fallback:**
- Broken or missing cover image → placeholder illustration
- Never display broken image icon

### UI Rules

- This spec translates Stitch design into implementation rules only
- No new design decisions are made here
- All visual properties come from Stitch tokens
- Responsive behavior must match Stitch breakpoints exactly

---

## ⚡ Phase 5 — Interaction Spec

📄 `05-books-interactions.spec.ts`

### Search & Filter Behavior

| Interaction | Behavior |
|-------------|----------|
| Search input change | Debounced 300ms before API call |
| Category filter change | Reset to page 1, immediate API call |
| Any filter change | URL query string updates synchronously |
| Page reload | Restore all filters from URL query string |
| Browser back/forward | Restore filter state from URL |
| Clear Filters button | Appears only when filters are active |
| Clear Filters click | Reset all filters, remove query params, load page 1 |

### Card Interactions

| Interaction | Behavior |
|-------------|----------|
| Card click (anywhere except action buttons) | Navigate to `/books/:id` detail page |
| Action button click | Stop event propagation (does not trigger card navigation) |
| Borrow button click | Optimistic UI update, revert on API error |
| Borrow success | Decrement `availableCopies`, update status badge |
| Borrow failure | Show error toast, restore previous state |

### Loading States

| Scenario | Visual Treatment |
|----------|------------------|
| Initial page load | Full grid skeleton (12 cards matching dimensions) |
| Filter change while data is present | Overlay spinner on existing grid (no skeleton flash) |
| Borrow/Return action | Disable button, show inline spinner on button only |
| Search while data is present | Overlay spinner on existing grid |

### Pagination

| Interaction | Behavior |
|-------------|----------|
| Page change | Scroll to top of grid, load new data |
| Active page | `aria-current="page"` attribute |
| First/Last page | Disable Previous/Next buttons respectively |

### Accessibility Interactions

- `Escape` key closes any open dropdown (category, sort)
- Focus ring is always visible on interactive elements
- `aria-live="polite"` region announces new search results
- Focus management: focus moves to first card after pagination change

### URL State Management

**Example URL:** `/books?category=science&search=physics&page=2`

- All filter state is serialized to query parameters
- Filters persist across page refreshes
- Sharing the URL preserves the filtered view
- Deep linking is fully supported

---

## 🚨 Phase 6 — Error & Edge Cases Spec

📄 `06-books-errors-edge.spec.ts`

### Error Matrix

| Error Type | What User Sees | Available Action | Recovery |
|------------|----------------|------------------|----------|
| Network timeout | "Connection problem. Please check your internet." | Retry button | Re-fires failed request |
| 500 Server Error | "Something went wrong. We're working on it." | Retry button | Re-fires failed request |
| 401 Unauthorized | — | — | Redirect to login page |
| 403 Forbidden | Permission denied toast notification | Dismiss toast | No retry allowed |
| 429 Rate Limited | "Too many requests. Please wait." | — | Auto-retry after 5 seconds |
| Zero results (with search) | "No books match '*search term*'" | "Try different search" link | Clears search input |
| Zero results (no filters) | "No books available yet" | — | Empty state illustration |
| Broken cover image | Placeholder illustration | — | Automatic fallback |
| Borrow conflict | "This book is no longer available" | "Refresh" button | Re-fetches book data |
| Offline | Offline banner at top of page | — | No API calls attempted |

### Error Boundary Strategy

```
BookErrorBoundary
  └── BookGrid          ← Wrapped (protected)
  
BookFilters             ← Not wrapped (remains functional)
Pagination              ← Not wrapped (remains functional)
```

**Rules:**
- If `BookGrid` crashes, filters and pagination remain operational
- Error boundary shows "Unable to display books" with retry button
- Retry re-renders the grid component tree
- Never show blank white screen on the books page

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Rapid filter changes | Only last API call resolves, previous cancelled |
| Borrow during filter change | Borrow request queues, executes after filter resolves |
| Zero totalCopies, availableCopies > 0 | Invalid state, display error, log to monitoring |
| Very long book title | Truncate with ellipsis, full title in tooltip |
| ISBN with hyphens/spaces | Normalize on input, store clean format |
| Same book borrowed twice (race condition) | Server rejects with 409 Conflict, show conflict resolution UI |

---

## ♿ Phase 7 — Accessibility & Performance Spec

📄 `07-books-a11y-performance.spec.ts`

### Accessibility (WCAG 2.1 AA)

#### Structural Semantics

| Element | Role/Attribute |
|---------|----------------|
| `BookGrid` | `role="list"` |
| `BookCard` | `role="listitem"` |
| Card title | `aria-label="[Title] by [Author], Status: [Status]"` |
| Action button | `aria-label="Borrow [Title] by [Author]"` |
| Status badge | Always includes visible text (never color alone) |
| Pagination active page | `aria-current="page"` |
| Search results region | `aria-live="polite"` for announcements |

#### Keyboard Navigation

- All interactive elements are focusable and operable via keyboard
- Tab order follows visual order
- `Escape` closes any open dropdown
- Focus ring is always visible (`:focus-visible` with 2px outline)
- Focus moves to first card after pagination change

#### Screen Reader Announcements

| Event | Announcement |
|-------|-------------|
| Search complete | "Found [N] books for '[search term]'" |
| Filter applied | "[N] books in [category] category" |
| Page change | "Page [X] of [Y], showing books [X-Y]" |
| Borrow success | "[Title] borrowed successfully" |
| Borrow error | "Unable to borrow [Title]. [error message]" |

#### Color & Contrast

- Status badges always include text labels (Available, Borrowed, Reserved)
- Color combinations meet WCAG AA contrast ratios (4.5:1 for text)
- Focus indicators have 3:1 minimum contrast against adjacent colors

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Largest Contentful Paint (LCP) | < 2.5 seconds | Lighthouse / Web Vitals |
| Cumulative Layout Shift (CLS) | 0 (zero) | Lighthouse / Web Vitals |
| Search feedback | < 300ms perceived | Time from keystroke to overlay spinner |
| Time to Interactive (TTI) | < 3 seconds | Lighthouse |
| First Input Delay (FID) | < 100ms | Web Vitals |

### Caching Strategy

**Implementation:** Tanstack Query

| Endpoint | Cache Duration | Stale-While-Revalidate | Invalidation Triggers |
|----------|---------------|------------------------|----------------------|
| `GET /books` | 60 seconds | 300 seconds | Any POST/PUT/DELETE to `/books` |
| `GET /books/:id` | 60 seconds | 300 seconds | `POST /books/:id/borrow`, `POST /books/:id/return` |
| `POST/PUT/DELETE` | No cache | — | Invalidates GET cache on success |

### Image Optimization

- **First 4 cards:** `loading="eager"` (above the fold on desktop)
- **Remaining cards:** `loading="lazy"` with `decoding="async"`
- **Srcset:** Two sizes — 200px (card thumbnail) / 400px (detail page)
- **Format:** WebP with JPEG fallback
- **Dimensions:** Explicit `width` and `height` attributes to prevent CLS

### Code Splitting

| Module | Loading Strategy |
|--------|-----------------|
| `BooksPage` | `React.lazy()` — lazy loaded |
| `BookFilters` | Included in main chunk |
| `BookGrid` | Included in main chunk |
| `BookCard` | Included in main chunk |
| Admin modals (Edit/Delete) | `React.lazy()` — separate chunk |
| Error Boundary | Included in main chunk |

---

## 🧪 Testing Strategy

### Test Files (Co-located)

```
/src/features/books/tests/
  BookCard.test.tsx
  BookGrid.test.tsx
  BookFilters.test.tsx
  BookEmptyState.test.tsx
  BookErrorBoundary.test.tsx
  useBooks.test.ts
  useBookFilters.test.ts
  useBookPermissions.test.ts
  books.api.test.ts
  books.permissions.test.ts
```

### Testing Matrix

| Phase | Test Type | Tools | Coverage |
|-------|-----------|-------|----------|
| Model | Type validation, enums | Zod + Vitest | All types, enums, derived fields |
| API | Endpoint contracts, error responses | MSW + Vitest | All endpoints, error codes |
| Hooks | Async state management | React Testing Library | Loading, error, success, empty states |
| Components | Render variants, role-based UI | RTL + Storybook | All role variants, all states |
| Interactions | User flows, optimistic updates | Playwright | Full user journeys |
| Errors | All failure paths | Vitest + Playwright | Every error matrix entry |
| Accessibility | Automated audit | axe-core + Playwright | All components, all states |
| Performance | Metrics validation | Lighthouse CI | LCP, CLS, TTI |

### Must-Pass Checklist Before Ship

- [ ] Filters update URL and trigger correct API call
- [ ] Page refresh restores all filter state from URL
- [ ] Browser back/forward preserves filter state
- [ ] Borrow button disabled when `availableCopies === 0`
- [ ] Admin sees Edit + Delete buttons, Student sees only Borrow
- [ ] Guest sees "Login to Borrow" with correct link
- [ ] Error boundary renders without breaking filters or pagination
- [ ] All cards pass axe-core accessibility audit
- [ ] LCP < 2.5s on 3G connection
- [ ] CLS = 0 during all loading transitions
- [ ] Optimistic borrow update reverts correctly on API error
- [ ] Skeleton cards match exact BookCard dimensions
- [ ] Zero results shows correct empty state based on active filters
- [ ] Keyboard navigation works for all interactive elements

---

## 🚀 Implementation Order

### Phase Execution

1. **Core + Model** — Define what the feature does and what data it works with
2. **API Contract** — Define all endpoints and response shapes
3. **Stitch Review** — Validate UI design against API and model
4. **UI Spec** — Translate Stitch into component rules
5. **Interactions** — Define all user behaviors and transitions
6. **Errors & Edge Cases** — Define all failure and edge scenarios
7. **Accessibility & Performance** — Define quality standards

### Build Order

1. Types and constants
2. API service layer
3. Hooks (useBooks, useBookFilters, useBookPermissions)
4. Components (BookCard → BookGrid → BookFilters → BookSkeleton → BookEmptyState → BookErrorBoundary)
5. BooksPage (composition)
6. Route integration
7. Tests (unit → integration → E2E)
