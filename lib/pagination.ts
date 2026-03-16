export type PaginationItem = number | 'ellipsis';
export const RECORDS_PAGE_SIZE = 6;
export const TEMPLATES_PAGE_SIZE = 5;

interface BuildPaginationItemsOptions {
  totalPages: number;
  currentPage: number;
  siblingCount?: number;
  boundaryCount?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function buildPaginationItems({
  totalPages,
  currentPage,
  siblingCount = 1,
  boundaryCount = 1,
}: BuildPaginationItemsOptions): PaginationItem[] {
  if (totalPages <= 0) return [];

  const safeCurrentPage = clamp(currentPage, 1, totalPages);
  const selectedPages = new Set<number>();

  for (let page = 1; page <= Math.min(boundaryCount, totalPages); page += 1) {
    selectedPages.add(page);
  }

  const startSiblingPage = Math.max(1, safeCurrentPage - siblingCount);
  const endSiblingPage = Math.min(totalPages, safeCurrentPage + siblingCount);
  for (let page = startSiblingPage; page <= endSiblingPage; page += 1) {
    selectedPages.add(page);
  }

  for (let page = Math.max(1, totalPages - boundaryCount + 1); page <= totalPages; page += 1) {
    selectedPages.add(page);
  }

  const orderedPages = [...selectedPages].sort((left, right) => left - right);
  const items: PaginationItem[] = [];

  for (const page of orderedPages) {
    const previous = items[items.length - 1];

    if (typeof previous === 'number') {
      const gap = page - previous;

      if (gap === 2) {
        items.push(previous + 1);
      } else if (gap > 2) {
        items.push('ellipsis');
      }
    }

    items.push(page);
  }

  return items;
}
