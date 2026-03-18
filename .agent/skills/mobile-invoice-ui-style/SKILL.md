---
name: mobile-invoice-ui-style
description: Use when implementing or refining SmartBill mobile invoice screens, bottom tabs, create/edit flows, preview screens, or any UI that must match the approved screenshot-driven layout, spacing, sizing, and PC-parity rules for this repo.
---

# Mobile Invoice UI Style

## Overview

Use this skill for SmartBill mobile UI work in this repo. It captures the user's approved layout and styling rules for invoice list, create/edit invoice, preview, and bottom action areas.

The goal is not "good mobile UI" in the abstract. The goal is to match the approved SmartBill visual language, follow screenshot proportions closely, and avoid inventing extra features or oversized layouts.

## Non-Negotiables

- Follow the provided screenshot first. Do not improvise when spacing, sizing, copy, or placement is visible in the reference.
- If the mobile UI conflicts with PC data structure, keep the PC fields and business logic, but present them in the approved mobile style.
- If the mobile shell conflicts with PC preview/export, keep the mobile shell for navigation but keep the document layout/export source aligned with PC.
- Do not add fields or controls that do not exist in PC unless the user explicitly asks for them.
- Prefer smaller and tighter over larger and looser. The user's repeated feedback is that default output tends to be too large.

## Design Direction

- Platform feel: iOS-like, calm, minimal, compact.
- Background: warm off-white, usually `#f6f5f2` or a nearby neutral.
- Cards: white surfaces with soft radius and very light shadow.
- Primary CTA: dark navy block, not bright blue.
- Secondary CTA: pale neutral fill with subtle border.
- Typography: compact, clean, understated. Avoid oversized headers, labels, and tab text.
- Chrome: minimal. Remove extra top bars or duplicated controls when the reference does not show them.

## Layout System

### Page Shell

- Use a warm neutral page background.
- Respect safe areas.
- Keep mobile horizontal padding tight. Current approved screens usually live around `14-18` horizontal padding.
- Vertical rhythm should be compact. Large blank gaps are usually wrong unless the screenshot clearly shows them.

### Bottom Dock

- Bottom actions live inside one white dock area.
- Dock must include safe area padding.
- If tabs are present, the tab bar and action button share the same white base when the screenshot shows that structure.
- The tab region should feel close to the bottom, using safe area plus a small visual inset rather than large extra padding.
- Primary action button in dock:
  - Height about `48`
  - Radius about `18`
  - Dark fill `#171f2d`
  - Bold centered text
- Secondary action button in dock:
  - Height about `44`
  - Radius about `16`
  - Light neutral fill
  - Thin border

### Top Actions

- Top pill buttons are allowed only when the screenshot shows them.
- Approved top pill pattern:
  - Height about `46`
  - Radius about `26`
  - White background or dark background for the emphasized action
- If the user asks to remove top chrome, remove it rather than preserving a generic header.

## Component Rules

### Cards

- White background
- Radius typically `18-24`
- Light shadow only
- Avoid heavy borders unless needed for structure
- Internal spacing should feel tight and intentional

### Tabs

- Bottom tabs must be visually compact
- Inner vertical padding should be low
- Labels should be smaller than default system tab bars
- Do not let selected pills become oversized

### Inputs

- Inputs should always have placeholders when practical
- Use compact input heights
- Apply input filtering and keyboard control by field type
- Dates are selection-based, not free text
- Dropdown-like choices should use bottom sheets on mobile

### Sheets

- Use bottom sheets for card editing instead of many nested routes
- Max height should be about `90%`
- Overflow scrolls inside the sheet
- If a child surface depends on drag gestures, such as signature drawing, disable outer sheet scrolling while that surface is active

## Invoice Module Rules

### PC Parity

- Keep invoice fields aligned with PC
- Remove mobile-only extras that are not in PC, such as the old `Photos` card
- Base fields should mirror PC naming and availability
- Do not reintroduce fields that were intentionally removed to match PC

### Create/Edit Structure

- Prefer a single page with summary cards and bottom-sheet editing
- Do not split simple sections into many extra routes unless the user explicitly asks
- Current approved card set is:
  - `Base`
  - `From`
  - `To`
  - `Items & Summary`
  - `Payment Info`
  - `Signature`
  - `Disclaimer`

### Items

- Keep the section compact
- Column config rows are single-line rows
- Do not show extra helper lines like `system-text`, `system-number`, or similar technical labels
- Item cards should not waste space with redundant labels like `Item 1` unless required
- `Amount` should occupy a full row when that improves clarity

### Payment Info

- Structure payment fields like items:
  - First show field-header configuration
  - Allow label editing plus shown/hidden control
  - Then show actual value entry below
- Value entry should be grouped into one card when possible
- Do not repeat useless `Value` labels if the field title already makes the meaning obvious

### From / To

- Support choosing saved profiles in a bottom sheet
- Logo upload should stay minimal:
  - one clean upload box
  - one small delete button
- Custom field rows should be clean and understated

### Preview

- App preview can be scaled down for screen viewing
- Exported result must match PC output
- Use one shared document source for preview and export, rather than maintaining a separate RN-only layout
- Mobile preview shell can differ from PC shell, but the invoice document itself should stay aligned with PC

## Screen-Specific Guidance

### When Matching a Screenshot

Review these parts separately before editing:

1. Top action buttons
2. Main title size
3. Filter or segmented control size
4. Card height and radius
5. List row spacing
6. Bottom dock height
7. Bottom tab icon and label size

Do not make global scale changes and assume the screen is fixed. Compare each component one by one.

### When the User Says Something Feels Too Big

Usually reduce:

- Header font size
- Tab label size
- Card vertical padding
- Button height only if the screenshot shows it
- Empty-state icon and copy size

Do not only reduce one title and leave everything else oversized.

## Workflow

1. Read the relevant screenshot and the nearest existing screen file.
2. Identify which parts are screenshot-driven and which parts must remain PC-parity-driven.
3. Reuse existing shared components before introducing new patterns.
4. If adding a new pattern, make it compatible with the current approved tokens in:
   - `app/create-invoice.tsx`
   - `app/invoice-preview.tsx`
   - `components/invoice-create/shared.tsx`
   - `src/shared/invoice-document.ts`
5. Keep code changes scoped. Do not restyle unrelated screens.
6. Verify with TypeScript after edits.

## Validation Checklist

- Does the screen match the screenshot proportionally, not just structurally?
- Are type sizes smaller and tighter than generic defaults?
- Are bottom dock and safe-area behaviors correct?
- Were any extra fields or controls added without explicit approval?
- If this touches invoice preview or export, does it still use the shared document source?
- If this touches payment or items, are config rows and value rows separated correctly?
- Did you avoid creating extra routes when a bottom sheet would suffice?
