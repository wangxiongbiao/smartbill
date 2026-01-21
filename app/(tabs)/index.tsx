import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>SmartBill Pro</Text>
          <Text style={styles.subtitle}>Professional Invoices in Seconds</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.card, styles.primaryCard]}
            onPress={() => router.push('/editor')}
          >
            <View style={styles.iconCircle}>
              <FontAwesome name="plus" size={24} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>New Invoice</Text>
            <Text style={styles.cardDesc}>Create a new invoice from scratch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/records')}>
            <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
              <FontAwesome name="list" size={24} color="#475569" />
            </View>
            <Text style={[styles.cardTitle, { color: '#0f172a' }]}>Records</Text>
            <Text style={styles.cardDesc}>View your invoice history</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateList}>
            {['Minimalist', 'Business', 'Creative'].map((t, i) => (
              <TouchableOpacity key={t} style={styles.templateCard} onPress={() => router.push('/editor')}>
                <View style={[styles.templatePreview, { backgroundColor: i === 0 ? '#e2e8f0' : i === 1 ? '#cbd5e1' : '#94a3b8' }]} />
                <Text style={styles.templateName}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  actions: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  primaryCard: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  templateList: {
    gap: 16,
  },
  templateCard: {
    marginRight: 16,
  },
  templatePreview: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});
