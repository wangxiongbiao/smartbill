import type { Invoice, InvoiceItem } from '../types';
import { buildInvoicePdfPlan, type InvoicePdfPageKind, type InvoicePdfPlan } from './invoice-pdf';

export interface InvoicePdfPageFitCheck {
  kind: InvoicePdfPageKind;
  items: InvoiceItem[];
}

export interface PaginateInvoicePdfByFittingParams {
  invoice: Invoice;
  canFitPage: (check: InvoicePdfPageFitCheck) => Promise<boolean>;
}

async function findMaxFittingPrefixCount({
  kind,
  items,
  canFitPage,
  leaveAtLeast = 0,
}: {
  kind: Exclude<InvoicePdfPageKind, 'single' | 'last'>;
  items: InvoiceItem[];
  canFitPage: PaginateInvoicePdfByFittingParams['canFitPage'];
  leaveAtLeast?: number;
}): Promise<number> {
  const maxCount = Math.max(0, items.length - leaveAtLeast);
  if (maxCount <= 0) return 0;

  let low = 1;
  let high = maxCount;
  let best = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const fits = await canFitPage({ kind, items: items.slice(0, mid) });

    if (fits) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(1, best);
}

export async function paginateInvoicePdfByFitting({ invoice, canFitPage }: PaginateInvoicePdfByFittingParams): Promise<InvoicePdfPlan> {
  if (invoice.items.length === 0) {
    return buildInvoicePdfPlan({
      invoice,
      pageItemGroups: [[]],
    });
  }

  if (invoice.items.length === 1 || await canFitPage({ kind: 'single', items: invoice.items })) {
    return buildInvoicePdfPlan({
      invoice,
      pageItemGroups: [invoice.items],
    });
  }

  const pageItemGroups: InvoiceItem[][] = [];
  let remainingItems = [...invoice.items];

  const firstPageItemCount = await findMaxFittingPrefixCount({
    kind: 'first',
    items: remainingItems,
    canFitPage,
    leaveAtLeast: 1,
  });
  pageItemGroups.push(remainingItems.slice(0, firstPageItemCount));
  remainingItems = remainingItems.slice(firstPageItemCount);

  while (remainingItems.length > 1 && !(await canFitPage({ kind: 'last', items: remainingItems }))) {
    const middlePageItemCount = await findMaxFittingPrefixCount({
      kind: 'middle',
      items: remainingItems,
      canFitPage,
      leaveAtLeast: 1,
    });
    pageItemGroups.push(remainingItems.slice(0, middlePageItemCount));
    remainingItems = remainingItems.slice(middlePageItemCount);
  }

  pageItemGroups.push(remainingItems);

  return buildInvoicePdfPlan({
    invoice,
    pageItemGroups,
  });
}
