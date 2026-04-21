# Invoice PDF Pagination Refactor Plan

> For Hermes: planning only, no implementation yet.

## Goal
Refactor invoice PDF export so multi-page invoices render as true paginated document pages instead of one long DOM screenshot sliced into A4 chunks.

## Why this is needed
Current export behavior is screenshot-based:
- render one long `InvoicePreview`
- capture with `html2canvas`
- cut the bitmap into A4 slices with `jsPDF`

This causes structural problems:
- page 2+ has no repeated header or table header
- totals / payment info are not reserved for the last page
- payment info may be visually clipped or awkwardly split
- page layout is not document-aware, only image-aware

## Current code involved
- `components/InvoicePreview.tsx`
- `components/app/AppShellPrintArea.tsx`
- `hooks/useInvoicePdfExport.ts`
- `lib/invoice.ts`
- `types.ts`

## Target behavior
### Page 1
- full invoice header
- client / date metadata
- item table header
- first page of item rows

### Middle pages
- compact repeated header
- repeated item table header
- only item rows

### Final page
- compact repeated header
- repeated item table header
- remaining item rows
- totals block
- payment info block
- signature / disclaimer / footer as decided by layout rules

## Architecture change
Move from **single preview + bitmap slicing** to **page model + per-page render**.

Introduce a pagination layer that:
1. measures row heights and section heights
2. computes page breaks before rendering PDF
3. renders each page individually using shared preview subcomponents
4. exports one rendered page per PDF page

## Proposed implementation steps

### Step 1: Split `InvoicePreview.tsx` into reusable page sections
**Objective:** separate shared invoice sections from full-page monolith.

Likely extraction targets:
- `InvoicePreviewHeader`
- `InvoicePreviewMeta`
- `InvoicePreviewTableHeader`
- `InvoicePreviewItemsTable`
- `InvoicePreviewTotals`
- `InvoicePreviewPaymentInfo`
- `InvoicePreviewFooter`
- `InvoicePreviewSignature`

**Files likely touched:**
- modify: `components/InvoicePreview.tsx`
- create: `components/invoice-preview/*.tsx` or similar small subcomponents

**Why first:** pagination is impossible to control cleanly while everything is inside one monolithic component.

---

### Step 2: Introduce an explicit PDF page model
**Objective:** define what one PDF page contains.

Add a pure data model, e.g.:
- `PdfInvoicePage`
- page kind: `first | middle | last | single`
- item range or item ids for this page
- booleans for showing totals / payment info / signature / footer

**Files likely touched:**
- create: `lib/invoice-pdf-layout.ts`
- possibly update: `types.ts`

**Why:** exporting must become rule-driven, not DOM-accident-driven.

---

### Step 3: Build section height measurement utilities
**Objective:** measure how much vertical space each section consumes.

Need measurement for:
- header block
- meta block
- table header
- each item row
- totals block
- payment info block
- disclaimer/footer
- signature block

Approach:
- render hidden measurement nodes in DOM
- use actual browser layout heights
- cache repeated measurements where safe

**Files likely touched:**
- create: `lib/invoice-pdf-measure.ts`
- create: `components/invoice-preview/InvoicePdfMeasureSurface.tsx`

**Risk:** this is the trickiest step; layout must be measured in the same styling context as final render.

---

### Step 4: Implement pagination algorithm
**Objective:** compute page contents before rendering.

Rules:
- reserve final-page bottom block height dynamically
- fit as many item rows as possible on page 1
- middle pages fit item rows only
- final page must leave room for totals + payment info (+ footer/signature if included)
- if payment info is very tall, reduce item rows on final page accordingly
- if final block alone exceeds a page, define fallback behavior explicitly

**Files likely touched:**
- create/modify: `lib/invoice-pdf-layout.ts`

**Important design choice:**
Totals + payment info should appear **only on last page**.

---

### Step 5: Create page-aware PDF render component
**Objective:** render one page from `PdfInvoicePage`.

Component idea:
- `InvoicePdfPage.tsx`

Inputs:
- full invoice
- page model
- language
- template
- compact/full header mode

This component renders exactly one A4 page DOM.

**Files likely touched:**
- create: `components/invoice-preview/InvoicePdfPage.tsx`

---

### Step 6: Replace export flow in `useInvoicePdfExport.ts`
**Objective:** export by rendering page-by-page instead of slicing one image.

New flow:
1. compute page models
2. for each page model:
   - render one detached A4 page
   - wait for fonts/images
   - `html2canvas` that single page
   - add one PDF page
3. save PDF

**Files likely touched:**
- modify: `hooks/useInvoicePdfExport.ts`
- possibly remove old bitmap-slicing code

**Expected benefit:**
- page 2+ gets header/table header
- last page correctly reserves totals/payment info
- no more fake slicing artifacts

---

### Step 7: Keep on-screen editor preview separate from PDF layout
**Objective:** avoid breaking normal live preview UX.

Important constraint:
- editor preview should remain continuous and interactive
- PDF export should use dedicated page-aware rendering

So do **not** force the editor preview itself to become paginated.

**Files likely touched:**
- `components/app/InvoiceEditorWorkspace.tsx`
- `components/InvoicePreview.tsx`
- new PDF-only page components

---

### Step 8: Define edge-case behavior
**Objective:** avoid regressions on extreme invoices.

Need explicit rules for:
- many item rows
- long multiline descriptions
- many payment fields
- long payment field values
- QR code present / absent
- signature shown / hidden
- disclaimer shown / hidden
- empty placeholder fields should not pollute PDF

**Likely changes:**
- filter empty placeholders from PDF mode
- maybe compact spacing in PDF-only components

---

### Step 9: Add verification checklist
**Manual test matrix:**
1. short invoice, 3 items
2. medium invoice, ~15 items
3. long invoice, 30+ items
4. long payment info with many custom fields
5. invoice with QR code
6. invoice with signature
7. invoice with disclaimer
8. Chinese content and long wrapping text

For each case verify:
- page 1 full header exists
- page 2+ compact header exists
- every page repeats table header
- last page contains totals + payment info
- no clipping at page bottom
- no duplicated totals on middle pages
- PDF page count sensible

## Risks / tradeoffs
1. **Bigger change than CSS fix** — this is structural, not cosmetic.
2. **DOM measurement complexity** — browser layout measurement must match export layout exactly.
3. **Performance** — multi-page render/export will cost more than bitmap slicing.
4. **Maintenance** — page-aware renderer introduces more components, but it is the correct abstraction.

## Fallback decisions to confirm before implementation
1. Should page 2+ use:
   - full header, or
   - compact header? (recommended: compact)
2. Should last page include:
   - signature + disclaimer + footer, or
   - only totals + payment info? (recommended: totals + payment info mandatory, others conditional)
3. If payment info becomes taller than expected, is it okay to push most/all items to previous pages? (recommended: yes)

## Recommended execution order
1. Extract preview sections
2. Build page model types
3. Add measurement surface
4. Implement pagination algorithm
5. Build page renderer
6. Replace export flow
7. Manual validation on 8 scenarios

## Suggested first implementation checkpoint
Before full export rewrite, stop after these milestones and review visually:
- `InvoicePdfPage` renders one page correctly
- compact header style agreed
- last-page bottom block style agreed
- table header repeat style agreed

## Short recommendation
Proceed with true pagination architecture. Do **not** keep stacking more CSS fixes on the current screenshot slicing approach.
