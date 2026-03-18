import Feather from '@expo/vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  calculateInvoiceTotals,
  getSortedInvoiceColumns,
  hasPaymentInfoContent,
} from '@/shared/invoice';
import { useInvoiceFlow } from '@/shared/invoice-flow';

function TopActionButton({
  dark = false,
  label,
  onPress,
}: {
  dark?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.topButton, dark && styles.topButtonDark]}>
      <Text allowFontScaling={false} style={[styles.topButtonText, dark && styles.topButtonTextDark]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function InvoicePreviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draftInvoice: invoice, submitDraftInvoice } = useInvoiceFlow();
  const totals = calculateInvoiceTotals(invoice.items, invoice.taxRate);
  const visibleColumns = getSortedInvoiceColumns(invoice.columnConfig).filter((column) => column.visible);

  const handleSubmit = () => {
    submitDraftInvoice();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 148 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <TopActionButton label="Back" onPress={() => router.back()} />
            <TopActionButton dark label="Create" onPress={handleSubmit} />
          </View>

          <Text allowFontScaling={false} style={styles.pageTitle}>
            Preview
          </Text>

          <View style={styles.previewCard}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text allowFontScaling={false} style={styles.docTitle}>
                  {invoice.customStrings?.invoiceTitle || (invoice.type === 'invoice' ? 'INVOICE' : 'RECEIPT')}
                </Text>
                {invoice.visibility?.invoiceNumber !== false ? (
                  <Text allowFontScaling={false} style={styles.docSubTitle}>
                    #{invoice.invoiceNumber}
                  </Text>
                ) : null}
              </View>

              <View style={styles.headerRight}>
                <Text allowFontScaling={false} style={styles.partyName}>
                  {invoice.sender.name || 'Your business'}
                </Text>
                {invoice.sender.address ? (
                  <Text allowFontScaling={false} style={styles.partyMeta}>
                    {invoice.sender.address}
                  </Text>
                ) : null}
                {invoice.sender.phone ? (
                  <Text allowFontScaling={false} style={styles.partyMeta}>
                    {invoice.sender.phone}
                  </Text>
                ) : null}
                {invoice.sender.email ? (
                  <Text allowFontScaling={false} style={styles.partyMeta}>
                    {invoice.sender.email}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.billBlock}>
                <Text allowFontScaling={false} style={styles.blockLabel}>
                  Bill to
                </Text>
                <Text allowFontScaling={false} style={styles.blockTitle}>
                  {invoice.client.name || 'Unknown client'}
                </Text>
                {invoice.client.address ? (
                  <Text allowFontScaling={false} style={styles.blockMeta}>
                    {invoice.client.address}
                  </Text>
                ) : null}
                {invoice.client.phone ? (
                  <Text allowFontScaling={false} style={styles.blockMeta}>
                    {invoice.client.phone}
                  </Text>
                ) : null}
                {invoice.client.email ? (
                  <Text allowFontScaling={false} style={styles.blockMeta}>
                    {invoice.client.email}
                  </Text>
                ) : null}
              </View>

              <View style={styles.dateColumn}>
                {invoice.visibility?.date !== false ? (
                  <View style={styles.dateRow}>
                    <Text allowFontScaling={false} style={styles.dateLabel}>
                      {invoice.customStrings?.dateLabel || 'Date'}
                    </Text>
                    <Text allowFontScaling={false} style={styles.dateValue}>
                      {invoice.date}
                    </Text>
                  </View>
                ) : null}
                {invoice.visibility?.dueDate !== false ? (
                  <View style={styles.dateRow}>
                    <Text allowFontScaling={false} style={styles.dateLabel}>
                      {invoice.customStrings?.dueDateLabel || 'Due Date'}
                    </Text>
                    <Text allowFontScaling={false} style={styles.dateValue}>
                      {invoice.dueDate}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.itemsSection}>
              <View style={styles.tableHead}>
                {visibleColumns.map((column) => (
                  <Text
                    key={column.id}
                    allowFontScaling={false}
                    style={[
                      styles.tableHeadText,
                      column.type === 'system-amount' && styles.tableHeadTextRight,
                    ]}
                  >
                    {column.label}
                  </Text>
                ))}
              </View>

              {invoice.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  {visibleColumns.map((column) => {
                    let value = '';

                    if (column.type === 'system-text') {
                      value = item.description || '-';
                    } else if (column.type === 'system-quantity') {
                      value = stringify(item.quantity) || '0';
                    } else if (column.type === 'system-rate') {
                      value = stringify(item.rate) || '0';
                    } else if (column.type === 'system-amount') {
                      const amount =
                        item.amount !== undefined && item.amount !== ''
                          ? Number(item.amount)
                          : Number(item.quantity || 0) * Number(item.rate || 0);
                      value = formatMoney(invoice.currency, amount);
                    } else {
                      value = String(item.customValues?.[column.id] || '-');
                    }

                    return (
                      <Text
                        key={column.id}
                        allowFontScaling={false}
                        style={[
                          styles.itemCell,
                          column.type === 'system-amount' && styles.itemCellRight,
                        ]}
                      >
                        {value}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.totalPanel}>
              <View style={styles.totalRow}>
                <Text allowFontScaling={false} style={styles.totalLabel}>
                  Subtotal
                </Text>
                <Text allowFontScaling={false} style={styles.totalValue}>
                  {formatMoney(invoice.currency, totals.subtotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text allowFontScaling={false} style={styles.totalLabel}>
                  Tax ({invoice.taxRate}%)
                </Text>
                <Text allowFontScaling={false} style={styles.totalValue}>
                  {formatMoney(invoice.currency, totals.tax)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowStrong]}>
                <Text allowFontScaling={false} style={styles.totalStrongLabel}>
                  Total
                </Text>
                <Text allowFontScaling={false} style={styles.totalStrongValue}>
                  {formatMoney(invoice.currency, totals.total)}
                </Text>
              </View>
            </View>

            {hasPaymentInfoContent(invoice.paymentInfo) && invoice.visibility?.paymentInfo === true ? (
              <View style={styles.previewSectionBlock}>
                <Text allowFontScaling={false} style={styles.previewSectionTitle}>
                  Payment info
                </Text>
                {(invoice.paymentInfo?.fields || [])
                  .filter((field) => field.visible && field.value.trim())
                  .map((field) => (
                    <View key={field.id} style={styles.paymentRow}>
                      <Text allowFontScaling={false} style={styles.paymentLabel}>
                        {field.label}
                      </Text>
                      <Text allowFontScaling={false} style={styles.paymentValue}>
                        {field.value}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : null}

            {invoice.visibility?.signature === true && invoice.sender.signature ? (
              <View style={styles.previewSectionBlock}>
                <Text allowFontScaling={false} style={styles.previewSectionTitle}>
                  Signature
                </Text>
                <Text allowFontScaling={false} style={styles.signatureText}>
                  Added
                </Text>
              </View>
            ) : null}

            {invoice.visibility?.disclaimer !== false && invoice.sender.disclaimerText ? (
              <View style={styles.previewSectionBlock}>
                <Text allowFontScaling={false} style={styles.previewSectionTitle}>
                  Disclaimer
                </Text>
                <Text allowFontScaling={false} style={styles.disclaimerText}>
                  {invoice.sender.disclaimerText}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.bottomDock, { paddingBottom: insets.bottom + 10 }]}>
          <Pressable onPress={handleSubmit} style={styles.submitButton}>
            <Text allowFontScaling={false} style={styles.submitButtonText}>
              Create Invoice
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function stringify(value: number | string | undefined) {
  return value === undefined ? '' : String(value);
}

function formatMoney(currency: string, amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topButton: {
    minWidth: 98,
    height: 46,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.03,
    shadowRadius: 24,
    elevation: 1,
  },
  topButtonDark: {
    backgroundColor: '#1a1916',
  },
  topButtonText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: '#111111',
  },
  topButtonTextDark: {
    fontWeight: '700',
    color: '#ffffff',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#050505',
    textAlign: 'center',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    gap: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.04,
    shadowRadius: 26,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#efefee',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  docTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#111111',
  },
  docSubTitle: {
    fontSize: 13,
    lineHeight: 16,
    color: '#71747c',
  },
  partyName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'right',
  },
  partyMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: '#7a7c82',
    textAlign: 'right',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  billBlock: {
    flex: 1,
    gap: 4,
  },
  dateColumn: {
    width: 120,
    gap: 10,
  },
  blockLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#9a9ca3',
    textTransform: 'uppercase',
  },
  blockTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#111111',
  },
  blockMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: '#7a7c82',
  },
  dateRow: {
    gap: 2,
  },
  dateLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: '#9a9ca3',
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: '#111111',
  },
  itemsSection: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#efefee',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#f7f6f4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  tableHeadText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: '#80838b',
    textTransform: 'uppercase',
  },
  tableHeadTextRight: {
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f1ef',
  },
  itemCell: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#111111',
  },
  itemCellRight: {
    textAlign: 'right',
    fontWeight: '700',
  },
  totalPanel: {
    alignSelf: 'flex-end',
    width: '72%',
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRowStrong: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#efefee',
  },
  totalLabel: {
    fontSize: 12,
    lineHeight: 15,
    color: '#7a7c82',
  },
  totalValue: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: '#111111',
  },
  totalStrongLabel: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#111111',
  },
  totalStrongValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#111111',
  },
  previewSectionBlock: {
    gap: 10,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#efefee',
  },
  previewSectionTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#9a9ca3',
    textTransform: 'uppercase',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentLabel: {
    width: 110,
    fontSize: 12,
    lineHeight: 16,
    color: '#7a7c82',
  },
  paymentValue: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#111111',
  },
  signatureText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#656870',
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  submitButton: {
    height: 48,
    borderRadius: 18,
    backgroundColor: '#171f2d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
