import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function formatIssuedDate() {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TopActionButton({
  dark = false,
  label,
  wide = false,
  onPress,
}: {
  dark?: boolean;
  label: string;
  wide?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.topButton, wide && styles.topButtonWide, dark && styles.topButtonDark]}
    >
      <Text allowFontScaling={false} style={[styles.topButtonText, dark && styles.topButtonTextDark]}>
        {label}
      </Text>
    </Pressable>
  );
}

function AddRow({
  label,
  showStar = false,
}: {
  label: string;
  showStar?: boolean;
}) {
  return (
    <Pressable style={styles.addRow}>
      <View style={styles.addRowContent}>
        <View style={styles.addCircle}>
          <Feather color="#ffffff" name="plus" size={14} strokeWidth={2.8} />
        </View>
        <Text allowFontScaling={false} style={styles.addRowText}>
          {label}
        </Text>
        {showStar ? (
          <View style={styles.starBadge}>
            <Feather color="#050505" name="star" size={14} fill="#050505" />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function CreateInvoiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 164 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <TopActionButton label="Cancel" onPress={() => router.back()} wide />

            <View style={styles.topRightActions}>
              <TopActionButton label="Preview" onPress={() => undefined} wide />
              <TopActionButton dark label="Done" onPress={() => router.back()} />
            </View>
          </View>

          <Text allowFontScaling={false} style={styles.title}>
            New invoice
          </Text>

          <View style={styles.section}>
            <View style={styles.metaLabels}>
              <View style={[styles.metaLabelCell, styles.metaLabelCellWide]}>
                <Text allowFontScaling={false} style={styles.sectionLabel}>
                  Issued
                </Text>
              </View>
              <View style={[styles.metaLabelCell, styles.metaLabelCellWide]}>
                <Text allowFontScaling={false} style={styles.sectionLabel}>
                  Due
                </Text>
              </View>
              <View style={[styles.metaLabelCell, styles.metaLabelCellNumber]}>
                <Text allowFontScaling={false} style={[styles.sectionLabel, styles.sectionLabelRight]}>
                  #
                </Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <View style={[styles.metaCell, styles.metaCellWide]}>
                <Text allowFontScaling={false} style={styles.metaValue}>
                  {formatIssuedDate()}
                </Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={[styles.metaCell, styles.metaCellWide]}>
                <Text allowFontScaling={false} style={styles.metaPlaceholder}>
                  -
                </Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={[styles.metaCell, styles.metaCellNumber]}>
                <Text allowFontScaling={false} style={styles.metaValue}>
                  KY250115
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Client
            </Text>
            <AddRow label="Add client" />
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Items
            </Text>
            <AddRow label="Add Item" />
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Summary
            </Text>
            <View style={styles.summaryCard}>
              <Text allowFontScaling={false} style={styles.summaryTitle}>
                Total
              </Text>

              <View style={styles.summaryRight}>
                <Pressable style={styles.currencyPill}>
                  <Text allowFontScaling={false} style={styles.currencyText}>
                    CNY
                  </Text>
                  <Feather color="#111111" name="chevron-down" size={16} strokeWidth={2.4} />
                </Pressable>

                <Text allowFontScaling={false} style={styles.summaryAmount}>
                  ¥0.00
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              Photos
            </Text>
            <AddRow label="Add photo" showStar />
          </View>
        </ScrollView>

        <View style={[styles.bottomDock, { paddingBottom: insets.bottom + 10 }]}>
          <Pressable style={styles.submitButton}>
            <Text allowFontScaling={false} style={styles.submitButtonText}>
              Create Invoice
            </Text>
          </Pressable>
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
  topRightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  topButton: {

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
  topButtonWide: {

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
  title: {
    fontSize: 26,

    fontWeight: '600',
    color: '#050505',
    textAlign: 'center',
    marginBottom: 15,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 15,
    color: '#94959c',
    marginBottom: 12,
  },
  metaLabels: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabelCell: {
    justifyContent: 'center',
  },
  metaLabelCellWide: {
    flex: 1,
  },
  metaLabelCellNumber: {
    width: 102,
  },
  sectionLabelRight: {
    textAlign: 'right',
  },
  metaCard: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  metaCell: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  metaCellWide: {
    flex: 1,
  },
  metaCellNumber: {
    width: 102,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#dedfe4',
  },
  metaValue: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#444444',
  },
  metaPlaceholder: {
    fontSize: 22,
    lineHeight: 26,
    color: '#c8c9cf',
  },
  addRow: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addCircle: {
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRowText: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '600',
    color: '#222222',
  },
  starBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d9dde8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  summaryCard: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryTitle: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: '#050505',
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyPill: {
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cfd0d6',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
  },
  currencyText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#111111',
  },
  summaryAmount: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '700',
    color: '#050505',
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    paddingTop: 14,
    paddingHorizontal: 14,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#171f2d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#ffffff',
  },
});
