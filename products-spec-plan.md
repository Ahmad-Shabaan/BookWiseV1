# 📦 Products Page --- SPECKIT Plan (Folder-Aligned + Stitch-Based)

## 🧭 Overview

This plan defines how the **Products feature** in the Library Management
System is structured using SPECKIT principles.

-   Specs are stored inside the feature folder
-   Stitch is used as the **UI source of truth**
-   Each phase = a spec file
-   Implementation follows specs directly

------------------------------------------------------------------------

# 🗂️ Folder Structure

    /src
      /features
        /products
          /specs
            01-products-core.spec.ts
            02-products-model.spec.ts
            03-products-api.spec.ts
            04-products-ui.spec.ts
            05-products-interactions.spec.ts
          /components
            ProductCard.tsx
            ProductGrid.tsx
            ProductFilters.tsx
          /pages
            ProductsPage.tsx
          /hooks
            useProducts.ts
            useProductFilters.ts
          /services
            products.api.ts
          /types
            product.types.ts
          /design
            stitch.products.json (or Stitch link reference)

------------------------------------------------------------------------

# 🧩 Phase 1 --- Core Feature Spec

📄 `01-products-core.spec.ts`

### Goal

Define system behavior (no UI, no API).

### Responsibilities

-   Display library products
-   Search by title / author
-   Filter by category
-   Support roles:
    -   Student: read-only
    -   Admin: full CRUD
-   Navigate to product details page

------------------------------------------------------------------------

# 🧱 Phase 2 --- Data Model Spec

📄 `02-products-model.spec.ts`

``` ts
Product {
  id: string
  title: string
  author: string
  category: string
  status: "available" | "borrowed"
  coverImage?: string
  createdAt: string
}
```

### Includes

-   Filter types
-   Sort options
-   Shared enums

------------------------------------------------------------------------

# 🔌 Phase 3 --- API Contract Spec

📄 `03-products-api.spec.ts`

### Endpoints

-   GET /products
-   GET /products/:id
-   POST /products (admin)
-   PUT /products/:id (admin)
-   DELETE /products/:id (admin)

### Query Support

-   search
-   category
-   pagination

### Rules

-   Users: read-only
-   Admin: full access

------------------------------------------------------------------------

# 🎨 Phase 4 --- UI Spec (Stitch Driven)

📄 `04-products-ui.spec.ts`

## 🔗 UI Source

-   Stitch design file: `stitch.products.json`
-   OR Stitch project link: `products-page-v1`

## UI Rules extracted from Stitch

-   Top section:
    -   Search bar
    -   Filter dropdown
-   Main section:
    -   Product grid layout
-   Product Card:
    -   title
    -   author
    -   status badge

## Responsive rules

-   Mobile: 1 column
-   Tablet: 2 columns
-   Desktop: 3--4 columns

## Important rule

👉 This spec does NOT design UI --- it only translates Stitch into rules

------------------------------------------------------------------------

# ⚡ Phase 5 --- Interaction Spec

📄 `05-products-interactions.spec.ts`

### Behavior rules

-   Search is debounced (300ms)
-   Filters reset pagination
-   Click product → `/products/:id`
-   Loading state → skeleton UI
-   Empty state → "No products found"

------------------------------------------------------------------------

# 🧠 Stitch Integration Concept

Stitch is NOT a phase.

It is: - UI reference - Design source - Input for UI spec only

Flow:

Specs → Stitch UI → UI rules → Components

------------------------------------------------------------------------

# 🚀 Final Development Flow

1.  Write Core + Model specs
2.  Define API contract
3.  Attach Stitch design reference
4.  Convert Stitch → UI spec rules
5.  Build components
6.  Implement hooks + services

------------------------------------------------------------------------

# 📌 Result

This structure ensures: - Clean separation of concerns - Predictable
feature scaling - Design consistency via Stitch - Full SPECKIT workflow
inside your repo
