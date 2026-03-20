import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetEditor, Field } from '@/components/invoice-create/shared';
import { useAuth } from '@/shared/auth/AuthProvider';
import { useInvoiceFlow } from '@/shared/invoice-flow';
import {
  getDashboardSummary,
  getMobileInvoices,
  getMobileTemplates,
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

export default function MyScreen() {
  const insets = useSafeAreaInsets();
  const {
    createdInvoices,
    defaultSender,
    deletedInvoiceIds,
    saveDefaultSenderProfile,
    savedTemplates,
    syncError,
  } = useInvoiceFlow();
  const { signOut, user } = useAuth();
  const [isSenderSheetVisible, setIsSenderSheetVisible] = useState(false);
  const [isSavingSender, setIsSavingSender] = useState(false);
  const [senderError, setSenderError] = useState('');
  const [senderDraft, setSenderDraft] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const invoices = useMemo(
    () => getMobileInvoices(createdInvoices, deletedInvoiceIds),
    [createdInvoices, deletedInvoiceIds]
  );
  const templates = useMemo(() => getMobileTemplates(savedTemplates), [savedTemplates]);
  const summary = useMemo(() => getDashboardSummary(invoices), [invoices]);

  const openSenderSheet = () => {
    setSenderError('');
    setSenderDraft({
      name: defaultSender.name || '',
      email: defaultSender.email || '',
      phone: defaultSender.phone || '',
      address: defaultSender.address || '',
    });
    setIsSenderSheetVisible(true);
  };

  const handleSaveSender = async () => {
    try {
      setIsSavingSender(true);
      setSenderError('');
      await saveDefaultSenderProfile(senderDraft);
      setIsSenderSheetVisible(false);
    } catch (error) {
      setSenderError(error instanceof Error ? error.message : 'Unable to save default sender.');
    } finally {
      setIsSavingSender(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 132 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text allowFontScaling={false} style={styles.avatarText}>
              G
            </Text>
          </View>
          <View style={styles.accountCopy}>
            <Text allowFontScaling={false} style={styles.accountName}>
              {user?.name || 'User'}
            </Text>
            <Text allowFontScaling={false} style={styles.accountEmail}>
              {user?.email || 'No email'}
            </Text>
            <View style={styles.providerBadge}>
              <Text allowFontScaling={false} style={styles.providerBadgeText}>
                {user?.provider ? `${user.provider} sign-in` : 'Signed in'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text allowFontScaling={false} style={styles.metricLabel}>
              Invoices
            </Text>
            <Text allowFontScaling={false} style={styles.metricValue}>
              {invoices.length}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text allowFontScaling={false} style={styles.metricLabel}>
              Templates
            </Text>
            <Text allowFontScaling={false} style={styles.metricValue}>
              {templates.length}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text allowFontScaling={false} style={styles.metricLabel}>
              Paid
            </Text>
            <Text allowFontScaling={false} numberOfLines={1} style={styles.metricValue}>
              {formatAmount(summary.paid)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Default sender
            </Text>
            <View style={styles.sectionHeaderActions}>
              <View style={styles.sectionBadge}>
                <Text allowFontScaling={false} style={styles.sectionBadgeText}>
                  Active
                </Text>
              </View>
              <Pressable onPress={openSenderSheet} style={styles.inlineAction}>
                <Feather color={MOBILE_THEME.primaryText} name="edit-3" size={13} strokeWidth={2.5} />
                <Text allowFontScaling={false} style={styles.inlineActionText}>
                  Edit
                </Text>
              </Pressable>
            </View>
          </View>

          <Text allowFontScaling={false} style={styles.senderName}>
            {defaultSender.name || remoteSenderName(user?.name)}
          </Text>
          {defaultSender.email ? (
            <Text allowFontScaling={false} style={styles.senderMeta}>
              {defaultSender.email}
            </Text>
          ) : null}
          {defaultSender.phone ? (
            <Text allowFontScaling={false} style={styles.senderMeta}>
              {defaultSender.phone}
            </Text>
          ) : null}
          {defaultSender.address ? (
            <Text allowFontScaling={false} style={styles.senderAddress}>
              {defaultSender.address}
            </Text>
          ) : (
            <Text allowFontScaling={false} style={styles.senderPlaceholder}>
              Set the sender once here and every new invoice will start with it prefilled.
            </Text>
          )}
          {syncError ? (
            <Text allowFontScaling={false} style={styles.senderError}>
              {syncError}
            </Text>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>
            Workspace
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingMain}>
              <Text allowFontScaling={false} style={styles.settingTitle}>
                Current plan
              </Text>
              <Text allowFontScaling={false} style={styles.settingText}>
                Professional Plus
              </Text>
            </View>
            <Feather color="#9a9ca3" name="chevron-right" size={18} strokeWidth={2.4} />
          </View>

          <View style={[styles.settingRow, styles.settingBorder]}>
            <View style={styles.settingMain}>
              <Text allowFontScaling={false} style={styles.settingTitle}>
                Template center
              </Text>
              <Text allowFontScaling={false} style={styles.settingText}>
                {templates.length} reusable setups
              </Text>
            </View>
            <Feather color="#9a9ca3" name="chevron-right" size={18} strokeWidth={2.4} />
          </View>

          <View style={[styles.settingRow, styles.settingBorder]}>
            <View style={styles.settingMain}>
              <Text allowFontScaling={false} style={styles.settingTitle}>
                Billing activity
              </Text>
              <Text allowFontScaling={false} style={styles.settingText}>
                {formatAmount(summary.total)} total billed
              </Text>
            </View>
            <Feather color="#9a9ca3" name="chevron-right" size={18} strokeWidth={2.4} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>
            Security
          </Text>
          <Text allowFontScaling={false} style={styles.securityText}>
            Your Google session is stored on device. Signing out will clear the local session and
            return to the login screen.
          </Text>

          <Pressable
            onPress={() => {
              signOut().catch(() => undefined);
            }}
            style={styles.logoutButton}
          >
            <Feather color="#c23b35" name="log-out" size={16} strokeWidth={2.4} />
            <Text allowFontScaling={false} style={styles.logoutButtonText}>
              Sign out
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomSheetEditor
        bottomInset={insets.bottom}
        onClose={() => setIsSenderSheetVisible(false)}
        title="Default sender"
        visible={isSenderSheetVisible}
      >
        <Field
          label="Company name"
          onChangeText={(value) => setSenderDraft((current) => ({ ...current, name: value }))}
          placeholder="SmartBill Studio"
          value={senderDraft.name}
        />
        <Field
          inputFilter="email"
          label="Billing email"
          onChangeText={(value) => setSenderDraft((current) => ({ ...current, email: value }))}
          placeholder="billing@example.com"
          value={senderDraft.email}
        />
        <Field
          inputFilter="phone"
          label="Phone"
          onChangeText={(value) => setSenderDraft((current) => ({ ...current, phone: value }))}
          placeholder="+86 138 0000 0000"
          value={senderDraft.phone}
        />
        <Field
          inputFilter="multilineText"
          label="Address"
          multiline
          onChangeText={(value) => setSenderDraft((current) => ({ ...current, address: value }))}
          placeholder="Registered address"
          value={senderDraft.address}
        />

        {senderError ? (
          <Text allowFontScaling={false} style={styles.senderSheetError}>
            {senderError}
          </Text>
        ) : null}

        <View style={styles.sheetActions}>
          <Pressable
            disabled={isSavingSender}
            onPress={() => void handleSaveSender()}
            style={[styles.sheetPrimaryButton, isSavingSender && styles.sheetPrimaryButtonDisabled]}
          >
            <Text allowFontScaling={false} style={styles.sheetPrimaryButtonText}>
              {isSavingSender ? 'Saving...' : 'Save sender'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setIsSenderSheetVisible(false)}
            style={styles.sheetSecondaryButton}
          >
            <Text allowFontScaling={false} style={styles.sheetSecondaryButtonText}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </BottomSheetEditor>
    </SafeAreaView>
  );
}

function remoteSenderName(fallbackName?: string) {
  return fallbackName || 'Not configured';
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
  accountCard: {
    borderRadius: 26,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  accountCopy: {
    flex: 1,
    gap: 6,
  },
  accountName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#171717',
  },
  accountEmail: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8d8f96',
  },
  providerBadge: {
    alignSelf: 'flex-start',
    borderRadius: 13,
    backgroundColor: MOBILE_THEME.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  providerBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: MOBILE_THEME.primaryText,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
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
    marginBottom: 10,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#171717',
  },
  sectionBadge: {
    borderRadius: 12,
    backgroundColor: MOBILE_THEME.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: MOBILE_THEME.primaryText,
  },
  inlineAction: {
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: '#f3f2ef',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineActionText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: MOBILE_THEME.primaryText,
  },
  senderName: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#171717',
    marginBottom: 8,
  },
  senderMeta: {
    fontSize: 12,
    lineHeight: 17,
    color: '#6f727a',
    marginBottom: 3,
  },
  senderAddress: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#8d8f96',
  },
  senderPlaceholder: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#a2a4ab',
  },
  senderError: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: '#b94136',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  settingBorder: {
    borderTopWidth: 1,
    borderTopColor: '#efeeeb',
  },
  settingMain: {
    flex: 1,
    gap: 5,
  },
  settingTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#171717',
  },
  settingText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8d8f96',
  },
  securityText: {
    marginTop: 10,
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 18,
    color: '#8d8f96',
  },
  logoutButton: {
    height: 44,
    borderRadius: 16,
    backgroundColor: '#fff0ef',
    borderWidth: 1,
    borderColor: '#f4d0cd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#c23b35',
  },
  senderSheetError: {
    fontSize: 12,
    lineHeight: 16,
    color: '#b94136',
    marginTop: -2,
  },
  sheetActions: {
    gap: 10,
    marginTop: 6,
  },
  sheetPrimaryButton: {
    height: 48,
    borderRadius: 18,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPrimaryButtonDisabled: {
    opacity: 0.45,
  },
  sheetPrimaryButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheetSecondaryButton: {
    height: 44,
    borderRadius: 16,
    backgroundColor: '#f3f2ef',
    borderWidth: 1,
    borderColor: '#e7e4dd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSecondaryButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#171717',
  },
});
