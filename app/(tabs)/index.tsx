import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type InvoiceFilter = 'All' | 'Unpaid' | 'Paid';

type InvoiceItem = {
  id: string;
  client: string;
  ref: string;
  date: string;
  amount: number;
  status: 'unpaid' | 'paid';
  overdueText?: string;
  muted?: boolean;
};

const FILTERS: InvoiceFilter[] = ['All', 'Unpaid', 'Paid'];

const INVOICES: InvoiceItem[] = [
  {
    id: 'invoice-0114',
    client: 'Unknown client',
    ref: '#KY...0114',
    date: 'Mar 13',
    amount: 0,
    status: 'unpaid',
    muted: true,
  },
  {
    id: 'invoice-0113',
    client: 'Alan ~ New energy procurement',
    ref: '#KY...0113',
    date: 'Mar 6',
    amount: 700,
    status: 'unpaid',
    overdueText: 'overdue 1d',
  },
  {
    id: 'invoice-0112',
    client: 'Alan ~ New energy procurement',
    ref: '#KY...0112',
    date: 'Jan 13',
    amount: 480700,
    status: 'unpaid',
    overdueText: 'overdue 413d',
  },
];

function formatAmount(amount: number) {
  return `¥${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<InvoiceFilter>('Paid');

  const filteredInvoices = useMemo(() => {
    if (activeFilter === 'All') {
      return INVOICES;
    }

    return INVOICES.filter((invoice) =>
      activeFilter === 'Paid' ? invoice.status === 'paid' : invoice.status === 'unpaid'
    );
  }, [activeFilter]);

  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  }, [filteredInvoices]);

  const isEmptyState = filteredInvoices.length === 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 248 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Pressable style={styles.iconButton}>
              <Feather color="#111111" name="message-square" size={22} strokeWidth={2.1} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Feather color="#111111" name="settings" size={22} strokeWidth={2.1} />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text allowFontScaling={false} style={styles.title}>
              Invoices
            </Text>

            <View style={styles.segment}>
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

            {!isEmptyState ? (
              <Text allowFontScaling={false} style={styles.totalText}>
                total: {formatAmount(totalAmount)}
              </Text>
            ) : null}
          </View>

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
            <View style={styles.listCard}>
              {filteredInvoices.map((invoice, index) => (
                <View
                  key={invoice.id}
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
                      {formatAmount(invoice.amount)}
                    </Text>
                    {invoice.overdueText ? (
                      <Text allowFontScaling={false} style={styles.overdueText}>
                        {invoice.overdueText}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 58,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 2,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '800',
    color: '#050505',
    marginBottom: 22,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#e4e3e1',
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
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,

    color: '#1b1b1b',
  },
  segmentTextActive: {
    fontWeight: '700',
  },
  totalText: {
    marginTop: 28,
    fontSize: 11,
    lineHeight: 14,
    color: '#9d9ea4',
  },
  emptyState: {
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 82,
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
    backgroundColor: '#c7c7cc',
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
});
