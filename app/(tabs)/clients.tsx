import Feather from '@expo/vector-icons/Feather';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const clients = [
  { name: 'Alan Trading', projects: '6 active invoices', email: 'alan@tradeco.com' },
  { name: 'Northwind Studio', projects: '2 estimates pending', email: 'team@northwind.io' },
  { name: 'Harbor Logistics', projects: 'Onboarding documents ready', email: 'ops@harbor.co' },
];

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 248 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text allowFontScaling={false} style={styles.eyebrow}>
          RELATIONSHIPS
        </Text>
        <Text allowFontScaling={false} style={styles.title}>
          Clients
        </Text>
        <Text allowFontScaling={false} style={styles.subtitle}>
          Third tab placeholder with a simple client directory and account snapshots.
        </Text>

        <View style={styles.searchCard}>
          <Feather color="#64748b" name="search" size={18} />
          <Text allowFontScaling={false} style={styles.searchText}>
            Search clients, companies or invoice IDs
          </Text>
        </View>

        <View style={styles.highlightCard}>
          <Text allowFontScaling={false} style={styles.highlightTitle}>
            Top client this quarter
          </Text>
          <Text allowFontScaling={false} style={styles.highlightName}>
            Alan Trading
          </Text>
          <Text allowFontScaling={false} style={styles.highlightHint}>
            Total billed: ¥188,400.00
          </Text>
        </View>

        <View style={styles.listCard}>
          {clients.map((client, index) => (
            <View key={client.name} style={[styles.clientRow, index < clients.length - 1 && styles.rowBorder]}>
              <View style={styles.avatar}>
                <Text allowFontScaling={false} style={styles.avatarText}>
                  {client.name.slice(0, 1)}
                </Text>
              </View>
              <View style={styles.clientMain}>
                <Text allowFontScaling={false} style={styles.clientName}>
                  {client.name}
                </Text>
                <Text allowFontScaling={false} style={styles.clientMeta}>
                  {client.projects}
                </Text>
                <Text allowFontScaling={false} style={styles.clientEmail}>
                  {client.email}
                </Text>
              </View>
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
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  searchText: {
    fontSize: 13,
    color: '#64748b',
  },
  highlightCard: {
    borderRadius: 24,
    backgroundColor: '#e8eef8',
    padding: 20,
    marginBottom: 14,
  },
  highlightTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  highlightName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  highlightHint: {
    fontSize: 12,
    color: '#334155',
  },
  listCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  clientRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f3',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#172033',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  clientMain: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  clientMeta: {
    fontSize: 12,
    color: '#475569',
  },
  clientEmail: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
