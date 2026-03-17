import Feather from '@expo/vector-icons/Feather';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const metrics = [
  { label: 'Revenue', value: '¥481,400', trend: '+12.4%' },
  { label: 'Outstanding', value: '¥53,820', trend: '-4.1%' },
  { label: 'Avg. payment', value: '18 days', trend: '-2 days' },
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 248 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text allowFontScaling={false} style={styles.eyebrow}>
          INSIGHTS
        </Text>
        <Text allowFontScaling={false} style={styles.title}>
          Reports
        </Text>
        <Text allowFontScaling={false} style={styles.subtitle}>
          Fourth tab placeholder for dashboard-style reports and performance snapshots.
        </Text>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text allowFontScaling={false} style={styles.heroTitle}>
              Cash flow
            </Text>
            <Feather color="#ffffff" name="activity" size={22} />
          </View>
          <Text allowFontScaling={false} style={styles.heroValue}>
            Healthy
          </Text>
          <Text allowFontScaling={false} style={styles.heroHint}>
            Collections improved over the last 30 days.
          </Text>
        </View>

        <View style={styles.metricList}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <Text allowFontScaling={false} style={styles.metricLabel}>
                {metric.label}
              </Text>
              <Text allowFontScaling={false} style={styles.metricValue}>
                {metric.value}
              </Text>
              <Text allowFontScaling={false} style={styles.metricTrend}>
                {metric.trend}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text allowFontScaling={false} style={styles.footerTitle}>
            Next step
          </Text>
          <Text allowFontScaling={false} style={styles.footerText}>
            Once you are happy with the structure, we can replace these placeholders with your real
            data views and charts.
          </Text>
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
    marginBottom: 18,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#172033',
    padding: 20,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  heroHint: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.78)',
  },
  metricList: {
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  metricLabel: {
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
  metricTrend: {
    fontSize: 11,
    color: '#2563eb',
  },
  footerCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 18,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
  },
});
