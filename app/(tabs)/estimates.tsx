import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const estimateCards = [
  { title: 'Draft', value: '08', hint: 'Need review before sending' },
  { title: 'Sent', value: '14', hint: 'Waiting for client reply' },
  { title: 'Accepted', value: '05', hint: 'Ready to convert into invoices' },
];

const recentEstimates = [
  { name: 'Q2 Website refresh', amount: '$12,800', status: 'Sent today' },
  { name: 'Warehouse signage', amount: '$3,640', status: 'Draft' },
  { name: 'Mobile app audit', amount: '$5,100', status: 'Accepted' },
];

export default function EstimatesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 248 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text allowFontScaling={false} style={styles.eyebrow}>
              SALES PIPELINE
            </Text>
            <Text allowFontScaling={false} style={styles.title}>
              Estimates
            </Text>
            <Text allowFontScaling={false} style={styles.subtitle}>
              A lightweight placeholder page so you can test the second tab flow.
            </Text>
          </View>
          <Pressable style={styles.actionButton}>
            <Feather color="#111827" name="plus" size={22} />
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text allowFontScaling={false} style={styles.summaryTitle}>
            This month
          </Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            $48,220
          </Text>
          <Text allowFontScaling={false} style={styles.summaryHint}>
            12 proposals were opened by clients this week.
          </Text>
        </View>

        <View style={styles.metricGrid}>
          {estimateCards.map((card) => (
            <View key={card.title} style={styles.metricCard}>
              <Text allowFontScaling={false} style={styles.metricTitle}>
                {card.title}
              </Text>
              <Text allowFontScaling={false} style={styles.metricValue}>
                {card.value}
              </Text>
              <Text allowFontScaling={false} style={styles.metricHint}>
                {card.hint}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.listCard}>
          <Text allowFontScaling={false} style={styles.listTitle}>
            Recent estimates
          </Text>
          {recentEstimates.map((estimate, index) => (
            <View
              key={estimate.name}
              style={[styles.listRow, index < recentEstimates.length - 1 && styles.listBorder]}
            >
              <View style={styles.listMain}>
                <Text allowFontScaling={false} style={styles.rowTitle}>
                  {estimate.name}
                </Text>
                <Text allowFontScaling={false} style={styles.rowHint}>
                  {estimate.status}
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.rowAmount}>
                {estimate.amount}
              </Text>
            </View>
          ))}
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
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#64748b',
    marginBottom: 10,
  },
  title: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    maxWidth: 280,
  },
  actionButton: {
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
  summaryCard: {
    borderRadius: 24,
    backgroundColor: '#172033',
    padding: 20,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  summaryHint: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
  },
  metricGrid: {
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  metricTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  metricHint: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748b',
  },
  listCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    paddingVertical: 8,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  listBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f3',
  },
  listMain: {
    flex: 1,
    gap: 6,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  rowHint: {
    fontSize: 12,
    color: '#64748b',
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});
