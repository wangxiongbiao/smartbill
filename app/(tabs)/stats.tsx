import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInvoiceFlow } from '@/shared/invoice-flow';
import {
  getDashboardSummary,
  getInvoiceAmount,
  getMobileInvoices,
  getMobileTemplates,
  isOverdueInvoice,
  isPaidInvoice,
} from '@/shared/mobile-hub';
import { MOBILE_THEME } from '@/shared/mobile-theme';

function formatAmount(amount: number, currency = 'CNY') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatShortDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createdInvoices, deletedInvoiceIds, savedTemplates } = useInvoiceFlow();

  const invoices = useMemo(
    () => getMobileInvoices(createdInvoices, deletedInvoiceIds),
    [createdInvoices, deletedInvoiceIds]
  );
  const templates = useMemo(() => getMobileTemplates(savedTemplates), [savedTemplates]);
  const dashboard = useMemo(() => getDashboardSummary(invoices), [invoices]);
  const chartMax = Math.max(...dashboard.last7Days.map((entry) => entry.amount), 1);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 142 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View>
            <Text allowFontScaling={false} style={styles.heroLabel}>
              Total billed
            </Text>
            <Text allowFontScaling={false} style={styles.heroValue}>
              {formatAmount(dashboard.total)}
            </Text>
            <Text allowFontScaling={false} style={styles.heroHint}>
              {invoices.length} invoices · {templates.length} templates
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <Feather color="#ffffff" name="bar-chart-2" size={18} strokeWidth={2.4} />
          </View>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text allowFontScaling={false} style={styles.metricLabel}>
              Unpaid
            </Text>
            <Text allowFontScaling={false} style={styles.metricValue}>
              {formatAmount(dashboard.unpaid)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text allowFontScaling={false} style={styles.metricLabel}>
              Paid
            </Text>
            <Text allowFontScaling={false} style={styles.metricValue}>
              {formatAmount(dashboard.paid)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text allowFontScaling={false} style={styles.metricLabel}>
              Overdue
            </Text>
            <Text allowFontScaling={false} style={styles.metricValue}>
              {formatAmount(dashboard.overdue)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text allowFontScaling={false} style={styles.metricLabel}>
              Paid rate
            </Text>
            <Text allowFontScaling={false} style={styles.metricValue}>
              {invoices.length ? `${Math.round((dashboard.paid / Math.max(dashboard.total, 1)) * 100)}%` : '0%'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Revenue trend
            </Text>
            <Text allowFontScaling={false} style={styles.sectionMeta}>
              Last 7 days
            </Text>
          </View>
          <View style={styles.chartRow}>
            {dashboard.last7Days.map((entry) => (
              <View key={entry.key} style={styles.chartItem}>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${Math.max((entry.amount / chartMax) * 100, entry.amount > 0 ? 14 : 0)}%` },
                    ]}
                  />
                </View>
                <Text allowFontScaling={false} style={styles.chartLabel}>
                  {entry.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={() => router.push('/create-invoice')} style={styles.quickActionCard}>
            <Feather color={MOBILE_THEME.primaryText} name="plus-circle" size={18} strokeWidth={2.2} />
            <Text allowFontScaling={false} style={styles.quickActionTitle}>
              Create invoice
            </Text>
            <Text allowFontScaling={false} style={styles.quickActionText}>
              Jump into the editor fast
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push('/templates')} style={styles.quickActionCard}>
            <Feather color={MOBILE_THEME.primaryText} name="layers" size={18} strokeWidth={2.2} />
            <Text allowFontScaling={false} style={styles.quickActionTitle}>
              Open templates
            </Text>
            <Text allowFontScaling={false} style={styles.quickActionText}>
              Reuse saved invoice setups
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Top clients
            </Text>
            <Text allowFontScaling={false} style={styles.sectionMeta}>
              This month
            </Text>
          </View>
          {dashboard.topClients.length === 0 ? (
            <Text allowFontScaling={false} style={styles.emptyText}>
              Client performance will appear here once invoices are created.
            </Text>
          ) : (
            dashboard.topClients.map((client, index) => (
              <View
                key={client.name}
                style={[styles.listRow, index < dashboard.topClients.length - 1 && styles.listBorder]}
              >
                <Text allowFontScaling={false} numberOfLines={1} style={styles.listTitle}>
                  {client.name}
                </Text>
                <Text allowFontScaling={false} style={styles.listAmount}>
                  {formatAmount(client.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Recent activity
            </Text>
            <Text allowFontScaling={false} style={styles.sectionMeta}>
              Latest invoices
            </Text>
          </View>
          {dashboard.recentInvoices.length === 0 ? (
            <Text allowFontScaling={false} style={styles.emptyText}>
              New invoice activity will show here automatically.
            </Text>
          ) : (
            dashboard.recentInvoices.map((invoice, index) => (
              <View
                key={invoice.id}
                style={[styles.activityRow, index < dashboard.recentInvoices.length - 1 && styles.listBorder]}
              >
                <View style={styles.activityMain}>
                  <Text allowFontScaling={false} numberOfLines={1} style={styles.listTitle}>
                    {invoice.client.name || 'Unknown client'}
                  </Text>
                  <Text allowFontScaling={false} style={styles.activityMeta}>
                    #{invoice.invoiceNumber} · {formatShortDate(invoice.date)}
                  </Text>
                </View>
                <View style={styles.activityRight}>
                  <Text allowFontScaling={false} style={styles.listAmount}>
                    {formatAmount(getInvoiceAmount(invoice), invoice.currency)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.activityStatus,
                      isPaidInvoice(invoice)
                        ? styles.activityStatusPaid
                        : isOverdueInvoice(invoice)
                          ? styles.activityStatusOverdue
                          : styles.activityStatusPending,
                    ]}
                  >
                    {isPaidInvoice(invoice)
                      ? 'Paid'
                      : isOverdueInvoice(invoice)
                        ? 'Overdue'
                        : 'Pending'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f5f2',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: MOBILE_THEME.primary,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  heroHint: {
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.72)',
  },
  heroIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: '47%',
    borderRadius: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: '#8d8f96',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#171717',
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#171717',
  },
  sectionMeta: {
    fontSize: 11,
    lineHeight: 14,
    color: '#a2a4ab',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartTrack: {
    width: '100%',
    height: 96,
    borderRadius: 14,
    backgroundColor: '#f2f1ee',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: MOBILE_THEME.primary,
    minHeight: 0,
  },
  chartLabel: {
    fontSize: 10,
    lineHeight: 12,
    color: '#8d8f96',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#171717',
  },
  quickActionText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8d8f96',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  listBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#efeeeb',
  },
  listTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#171717',
  },
  listAmount: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#171717',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8d8f96',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  activityMain: {
    flex: 1,
    gap: 5,
  },
  activityMeta: {
    fontSize: 11,
    lineHeight: 14,
    color: '#9a9ca3',
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 5,
  },
  activityStatus: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  activityStatusPaid: {
    color: '#2f8f5b',
  },
  activityStatusPending: {
    color: '#8d8f96',
  },
  activityStatusOverdue: {
    color: '#d35656',
  },
});
