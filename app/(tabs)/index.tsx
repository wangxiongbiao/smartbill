import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { calculateInvoiceTotals } from '@/shared/invoice';
import { useInvoiceFlow } from '@/shared/invoice-flow';
import { MOBILE_THEME } from '@/shared/mobile-theme';
import { SEEDED_INVOICE_RECORDS } from '@/shared/seed-invoices';

type InvoiceFilter = 'All' | 'Unpaid' | 'Paid';

type InvoiceItem = {
  id: string;
  client: string;
  ref: string;
  date: string;
  amount: number;
  currency?: string;
  status: 'unpaid' | 'paid';
  overdueText?: string;
  muted?: boolean;
};

const FILTERS: InvoiceFilter[] = ['All', 'Unpaid', 'Paid'];

function formatAmount(amount: number, currency = 'CNY') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatListDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<InvoiceFilter>('Paid');
  const { createdInvoices, deletedInvoiceIds } = useInvoiceFlow();

  const mergedInvoices = useMemo(() => {
    const localInvoices: InvoiceItem[] = createdInvoices.map((invoice) => ({
      id: invoice.id,
      client: invoice.client.name || 'Unknown client',
      ref: `#${invoice.invoiceNumber}`,
      date: formatListDate(invoice.date),
      amount: calculateInvoiceTotals(invoice.items, invoice.taxRate).total,
      currency: invoice.currency,
      status: invoice.status === 'Paid' ? 'paid' : 'unpaid',
      muted: !invoice.client.name,
    }));

    const seededInvoices: InvoiceItem[] = SEEDED_INVOICE_RECORDS.map((record) => ({
      id: record.invoice.id,
      client: record.invoice.client.name || 'Unknown client',
      ref: `#${record.invoice.invoiceNumber}`,
      date: formatListDate(record.invoice.date),
      amount: calculateInvoiceTotals(record.invoice.items, record.invoice.taxRate).total,
      currency: record.invoice.currency,
      status: record.invoice.status === 'Paid' ? 'paid' : 'unpaid',
      muted: record.muted,
      overdueText: record.overdueText,
    }));

    return [...localInvoices, ...seededInvoices].filter(
      (invoice) => !deletedInvoiceIds.includes(invoice.id)
    );
  }, [createdInvoices, deletedInvoiceIds]);

  useEffect(() => {
    if (createdInvoices.length > 0 && activeFilter === 'Paid') {
      setActiveFilter('All');
    }
  }, [activeFilter, createdInvoices.length]);

  const filteredInvoices = useMemo(() => {
    if (activeFilter === 'All') {
      return mergedInvoices;
    }

    return mergedInvoices.filter((invoice) =>
      activeFilter === 'Paid' ? invoice.status === 'paid' : invoice.status === 'unpaid'
    );
  }, [activeFilter, mergedInvoices]);

  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  }, [filteredInvoices]);

  const isEmptyState = filteredInvoices.length === 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 316 }]}
          showsVerticalScrollIndicator={false}
        >
          {isEmptyState ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather color="#c7c7cc" name="file-text" size={34} strokeWidth={2} />
                <View style={styles.emptyCheckBadge}>
                  <Feather color="#ffffff" name="check" size={12} strokeWidth={3} />
                </View>
              </View>
              <Text allowFontScaling={false} style={styles.emptyText}>
                Paid invoices will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.listState}>
              <View style={styles.listCard}>
                {filteredInvoices.map((invoice, index) => (
                  <Pressable
                    key={invoice.id}
                    onPress={() => router.push(`/invoice-detail/${invoice.id}`)}
                    style={[styles.invoiceRow, index < filteredInvoices.length - 1 && styles.rowBorder]}
                  >
                    <View style={styles.invoiceMain}>
                      <Text
                        allowFontScaling={false}
                        style={[styles.clientText, invoice.muted && styles.mutedClient]}
                      >
                        {invoice.client}
                      </Text>
                      <Text allowFontScaling={false} style={styles.metaText}>
                        {invoice.ref}, {invoice.date}
                      </Text>
                    </View>

                    <View style={styles.amountBlock}>
                      <Text allowFontScaling={false} style={styles.amountText}>
                        {formatAmount(invoice.amount, invoice.currency)}
                      </Text>
                      {invoice.overdueText ? (
                        <Text allowFontScaling={false} style={styles.overdueText}>
                          {invoice.overdueText}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </View>

              <Text allowFontScaling={false} style={styles.totalText}>
                total: {formatAmount(totalAmount)}
              </Text>
            </View>
          )}
        </ScrollView>

        <View
          pointerEvents="box-none"
          style={[styles.filterDock, { bottom: insets.bottom + 152 }]}
        >
          <View style={[styles.segment, styles.segmentFloating]}>
            {FILTERS.map((filter) => {
              const selected = filter === activeFilter;

              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[styles.segmentButton, selected && styles.segmentButtonActive]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[styles.segmentText, selected && styles.segmentTextActive]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f5f2',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f6f5f2',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: MOBILE_THEME.primarySoft,
    borderRadius: 21,
    padding: 3,
  },
  segmentButton: {
    minHeight: 34,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  segmentButtonActive: {
    backgroundColor: MOBILE_THEME.primary,
    shadowColor: MOBILE_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 1,
  },
  segmentFloating: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    color: MOBILE_THEME.primaryText,
  },
  segmentTextActive: {
    fontWeight: '700',
    color: '#ffffff',
  },
  totalText: {
    alignSelf: 'center',
    marginTop: 12,
    fontSize: 11,
    lineHeight: 14,
    color: '#9d9ea4',
  },
  emptyState: {
    minHeight: 560,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 128,
  },
  emptyIconWrap: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  emptyCheckBadge: {
    position: 'absolute',
    right: -1,
    bottom: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 17,
    color: '#9999a1',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f3',
  },
  invoiceMain: {
    flex: 1,
    gap: 6,
  },
  clientText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#09090b',

  },
  mutedClient: {
    color: '#9a9ca3',
    fontWeight: '500',
  },
  metaText: {
    fontSize: 12,
    color: '#9a9ca3',
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountText: {
    fontSize: 17,
    color: '#09090b',
    lineHeight: 22,
  },
  overdueText: {
    fontSize: 11,
    color: '#ff4e62',
  },
  listCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  listState: {
    minHeight: 560,
    justifyContent: 'center',
  },
  filterDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
});
