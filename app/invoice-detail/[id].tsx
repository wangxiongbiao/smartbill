import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { BottomSheetEditor, Field } from '@/components/invoice-create/shared';
import { useAuth } from '@/shared/auth/AuthProvider';
import { API_BASE_URL } from '@/shared/auth/config';
import { shareInvoicePdfFile } from '@/shared/invoice-actions';
import {
  buildInvoiceDocumentHtml,
  DEFAULT_INVOICE_DOCUMENT_LANGUAGE,
} from '@/shared/invoice-document';
import { useInvoiceFlow } from '@/shared/invoice-flow';
import {
  createInvoiceShareRemote,
  sendInvoiceShareEmailRemote,
} from '@/shared/mobile-api';
import { MOBILE_THEME } from '@/shared/mobile-theme';
import { getTemplateTypeLabel, TEMPLATE_TYPE_OPTIONS } from '@/shared/template-types';
import type { Invoice, TemplateCategory } from '@/shared/types';

const DETAIL_ACTIONS = [
  { key: 'download', icon: 'download', label: 'Download' },
  { key: 'template', icon: 'bookmark', label: 'Template' },
  { key: 'share', icon: 'share', label: 'Share' },
  { key: 'edit', icon: 'edit-3', label: 'Edit' },
] as const;

type BusyAction = 'download' | 'share' | 'send' | 'template' | null;
const STATUS_OPTIONS: Invoice['status'][] = ['Draft', 'Pending', 'Sent', 'Paid'];

export default function InvoiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();
  const {
    createdInvoices,
    deletedInvoiceIds,
    removeInvoice,
    saveTemplate,
    setDraftInvoice,
    updateInvoiceStatus,
  } = useInvoiceFlow();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSendSheetVisible, setIsSendSheetVisible] = useState(false);
  const [isTemplateSheetVisible, setIsTemplateSheetVisible] = useState(false);
  const [isTemplateTypeSheetVisible, setIsTemplateTypeSheetVisible] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateType, setTemplateType] = useState<TemplateCategory | null>(null);
  const [templateError, setTemplateError] = useState('');
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const invoice = (() => {
    if (!id || deletedInvoiceIds.includes(String(id))) {
      return null;
    }

    return createdInvoices.find((item) => item.id === id) || null;
  })();

  const previewHtml = invoice
    ? buildInvoiceDocumentHtml(invoice, {
      lang: DEFAULT_INVOICE_DOCUMENT_LANGUAGE,
      mode: 'thumbnail',
    })
    : '';

  useEffect(() => {
    setRecipientEmail(invoice?.client.email || '');
  }, [invoice?.client.email]);

  if (!invoice) {
    return null;
  }

  const handleDelete = async () => {
    await removeInvoice(String(invoice.id));
    setIsMenuVisible(false);
    router.replace('/(tabs)');
  };

  const openTemplateSheet = () => {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateType(null);
    setTemplateError('');
    setIsTemplateSheetVisible(true);
  };

  const handleDownload = async () => {
    try {
      setBusyAction('download');
      await shareInvoicePdfFile(invoice, {
        dialogTitle: 'Save invoice PDF',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleShare = async () => {
    try {
      setBusyAction('share');
      setFeedbackMessage(null);

      if (!accessToken) {
        throw new Error('Sign in again before sharing an invoice link.');
      }

      const share = await createInvoiceShareRemote(accessToken, String(invoice.id), {
        allowDownload: true,
        expiresInDays: null,
      });

      if (!share) {
        throw new Error('Unable to create a share link.');
      }

      const shareUrl = `${API_BASE_URL}/share/${share.share_token}`;
      await Share.share({
        title: `Invoice ${invoice.invoiceNumber}`,
        message: shareUrl,
        url: shareUrl,
      });
      setFeedbackMessage({
        tone: 'success',
        text: 'Share link ready.',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create a share link.';
      setFeedbackMessage({
        tone: 'error',
        text: message,
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleEdit = () => {
    setDraftInvoice(invoice);
    router.push('/create-invoice');
  };

  const handleSaveTemplate = async () => {
    const trimmedName = templateName.trim();
    const trimmedDescription = templateDescription.trim();

    if (!trimmedName) {
      setTemplateError('Template name is required.');
      return;
    }

    if (!templateType) {
      setTemplateError('Template type is required.');
      return;
    }

    try {
      setBusyAction('template');
      await saveTemplate({
        invoice,
        name: trimmedName,
        description: trimmedDescription,
        templateType,
      });
      setTemplateError('');
      setIsTemplateSheetVisible(false);
      setFeedbackMessage({
        tone: 'success',
        text: 'Template saved.',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save template.';
      setTemplateError(message);
    } finally {
      setBusyAction(null);
    }
  };

  const handleSend = async () => {
    if (!recipientEmail.trim()) {
      return;
    }

    try {
      setBusyAction('send');
      setFeedbackMessage(null);

      if (!accessToken) {
        throw new Error('Sign in again before sending invoice email.');
      }

      const share = await createInvoiceShareRemote(accessToken, String(invoice.id), {
        allowDownload: true,
        expiresInDays: null,
      });

      if (!share) {
        throw new Error('Unable to create a secure share link.');
      }

      const shareUrl = `${API_BASE_URL}/share/${share.share_token}`;
      const response = await sendInvoiceShareEmailRemote(accessToken, {
        email: recipientEmail.trim(),
        invoiceNumber: invoice.invoiceNumber,
        shareUrl,
        senderName: invoice.sender.name || 'SmartBill',
      });

      if (!response.success) {
        throw new Error(response.message || 'Unable to send invoice email.');
      }

      setIsSendSheetVisible(false);
      setFeedbackMessage({
        tone: 'success',
        text: response.mock ? 'Email queued in mock mode.' : 'Invoice email sent.',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to send invoice email.';
      setFeedbackMessage({
        tone: 'error',
        text: message,
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleStatusChange = async (nextStatus: Invoice['status']) => {
    if (!nextStatus || nextStatus === invoice.status || isUpdatingStatus) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setFeedbackMessage(null);
      await updateInvoiceStatus(String(invoice.id), nextStatus);
      setFeedbackMessage({
        tone: 'success',
        text: `Status updated to ${nextStatus}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update invoice status.';
      setFeedbackMessage({
        tone: 'error',
        text: message,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 238 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.iconCircle}>
              <Feather color="#111111" name="arrow-left" size={22} strokeWidth={2.5} />
            </Pressable>

            <Pressable onPress={() => setIsMenuVisible(true)} style={styles.iconCircle}>
              <Feather color="#111111" name="more-horizontal" size={22} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.metaCard}>
            <View style={styles.metaCopy}>
              <Text allowFontScaling={false} style={styles.metaEyebrow}>
                Invoice #{invoice.invoiceNumber}
              </Text>
              <Text allowFontScaling={false} style={styles.metaTitle}>
                {invoice.client.name || 'Untitled client'}
              </Text>
              <Text allowFontScaling={false} style={styles.metaSubcopy}>
                {invoice.date} · {invoice.currency}
              </Text>
            </View>

            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((status) => {
                const active = invoice.status === status;

                return (
                  <Pressable
                    key={status}
                    disabled={isUpdatingStatus}
                    onPress={() => void handleStatusChange(status)}
                    style={[styles.statusChip, active && styles.statusChipActive]}
                  >
                    <Text
                      allowFontScaling={false}
                      style={[styles.statusChipText, active && styles.statusChipTextActive]}
                    >
                      {status}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {feedbackMessage ? (
            <View
              style={[
                styles.feedbackBanner,
                feedbackMessage.tone === 'error' && styles.feedbackBannerError,
              ]}
            >
              <Feather
                color={feedbackMessage.tone === 'error' ? '#b94136' : '#1a6a43'}
                name={feedbackMessage.tone === 'error' ? 'alert-circle' : 'check-circle'}
                size={15}
                strokeWidth={2.4}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.feedbackText,
                  feedbackMessage.tone === 'error' && styles.feedbackTextError,
                ]}
              >
                {feedbackMessage.text}
              </Text>
            </View>
          ) : null}

          <View style={styles.previewStage}>
            <View style={styles.previewCanvas}>
              <WebView
                bounces={false}
                originWhitelist={['*']}
                scrollEnabled={false}
                setSupportMultipleWindows={false}
                showsVerticalScrollIndicator={false}
                source={{ html: previewHtml }}
                style={styles.previewWebview}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomDock, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.actionRow}>
            {DETAIL_ACTIONS.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => {
                  if (action.key === 'download') {
                    void handleDownload();
                    return;
                  }

                  if (action.key === 'share') {
                    void handleShare();
                    return;
                  }

                  if (action.key === 'template') {
                    openTemplateSheet();
                    return;
                  }

                  handleEdit();
                }}
                style={styles.actionItem}
              >
                {busyAction === action.key ? (
                  <ActivityIndicator color="#111111" size="small" />
                ) : (
                  <Feather color="#111111" name={action.icon} size={22} strokeWidth={2.1} />
                )}
                <Text allowFontScaling={false} style={styles.actionLabel}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setIsSendSheetVisible(true)} style={styles.sendButton}>
            {busyAction === 'send' ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text allowFontScaling={false} style={styles.sendButtonText}>
                Send invoice
              </Text>
            )}
          </Pressable>
        </View>

        <Modal
          animationType="fade"
          onRequestClose={() => setIsMenuVisible(false)}
          presentationStyle="overFullScreen"
          statusBarTranslucent
          transparent
          visible={isMenuVisible}
        >
          <View style={styles.modalOverlay}>
            <Pressable onPress={() => setIsMenuVisible(false)} style={styles.modalBackdrop} />
            <View style={styles.modalCard}>
              <Text allowFontScaling={false} style={styles.modalTitle}>
                Delete invoice
              </Text>
              <Text allowFontScaling={false} style={styles.modalDescription}>
                Remove this invoice from the current list.
              </Text>

              <Pressable onPress={() => void handleDelete()} style={styles.deleteButton}>
                <Text allowFontScaling={false} style={styles.deleteButtonText}>
                  Delete
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsMenuVisible(false)}
                style={styles.cancelButton}
              >
                <Text allowFontScaling={false} style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <BottomSheetEditor
          bottomInset={insets.bottom}
          onClose={() => setIsSendSheetVisible(false)}
          title="Send invoice"
          visible={isSendSheetVisible}
        >
          <View style={styles.sheetCopy}>
            <Text allowFontScaling={false} style={styles.sheetLead}>
              This follows the PC flow: SmartBill creates a secure share link and sends the email
              from the server.
            </Text>
            <Text allowFontScaling={false} style={styles.sheetMeta}>
              Invoice #{invoice.invoiceNumber}
            </Text>
          </View>

          <Field
            inputFilter="email"
            label="Recipient email"
            onChangeText={setRecipientEmail}
            placeholder="client@example.com"
            value={recipientEmail}
          />

          <View style={styles.sheetActions}>
            <Pressable
              disabled={busyAction === 'send' || !recipientEmail.trim()}
              onPress={() => void handleSend()}
              style={[
                styles.sheetPrimaryButton,
                (!recipientEmail.trim() || busyAction === 'send') && styles.sheetPrimaryButtonDisabled,
              ]}
            >
              <Text allowFontScaling={false} style={styles.sheetPrimaryButtonText}>
                Send invoice
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsSendSheetVisible(false)}
              style={styles.sheetSecondaryButton}
            >
              <Text allowFontScaling={false} style={styles.sheetSecondaryButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </BottomSheetEditor>

        <BottomSheetEditor
          bottomInset={insets.bottom}
          onClose={() => {
            setIsTemplateSheetVisible(false);
            setTemplateError('');
          }}
          title="Save as template"
          visible={isTemplateSheetVisible}
        >
          <View style={styles.sheetCopy}>
            <Text allowFontScaling={false} style={styles.sheetLead}>
              Save this invoice configuration as a reusable template.
            </Text>
            <Text allowFontScaling={false} style={styles.sheetMeta}>
              Invoice #{invoice.invoiceNumber}
            </Text>
          </View>

          <Field
            label="Template name"
            onChangeText={(value) => {
              setTemplateError('');
              setTemplateName(value);
            }}
            placeholder="Enter template name"
            value={templateName}
          />

          <View style={styles.selectGroup}>
            <Text allowFontScaling={false} style={styles.fieldLabel}>
              Template type
            </Text>
            <Pressable
              onPress={() => setIsTemplateTypeSheetVisible(true)}
              style={styles.selectField}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.selectFieldText,
                  !templateType && styles.selectFieldPlaceholder,
                ]}
              >
                {templateType ? getTemplateTypeLabel(templateType) : 'Select a template type'}
              </Text>
              <Feather color="#8f9198" name="chevron-down" size={18} strokeWidth={2.3} />
            </Pressable>
          </View>

          <Field
            label="Description"
            multiline
            onChangeText={setTemplateDescription}
            placeholder="Optional description"
            value={templateDescription}
          />

          {templateError ? (
            <Text allowFontScaling={false} style={styles.sheetError}>
              {templateError}
            </Text>
          ) : null}

          <View style={styles.sheetActions}>
            <Pressable
              disabled={busyAction === 'template'}
              onPress={() => void handleSaveTemplate()}
              style={[
                styles.sheetPrimaryButton,
                busyAction === 'template' && styles.sheetPrimaryButtonDisabled,
              ]}
            >
              {busyAction === 'template' ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text allowFontScaling={false} style={styles.sheetPrimaryButtonText}>
                  Save template
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setIsTemplateSheetVisible(false);
                setTemplateError('');
              }}
              style={styles.sheetSecondaryButton}
            >
              <Text allowFontScaling={false} style={styles.sheetSecondaryButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </BottomSheetEditor>

        <BottomSheetEditor
          bottomInset={insets.bottom}
          onClose={() => setIsTemplateTypeSheetVisible(false)}
          title="Template type"
          visible={isTemplateTypeSheetVisible}
        >
          <View style={styles.optionList}>
            {TEMPLATE_TYPE_OPTIONS.map((option) => {
              const active = option.value === templateType;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setTemplateError('');
                    setTemplateType(option.value);
                    setIsTemplateTypeSheetVisible(false);
                  }}
                  style={[styles.optionRow, active && styles.optionRowActive]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[styles.optionLabel, active && styles.optionLabelActive]}
                  >
                    {option.label}
                  </Text>
                  {active ? (
                    <Feather color={MOBILE_THEME.primaryText} name="check" size={16} strokeWidth={2.6} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </BottomSheetEditor>
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
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  metaCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 14,
  },
  metaCopy: {
    gap: 4,
  },
  metaEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#7f8490',
  },
  metaTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    color: '#161616',
  },
  metaSubcopy: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8d9098',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#f3f2ef',
    borderWidth: 1,
    borderColor: '#ebe8e1',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipActive: {
    backgroundColor: MOBILE_THEME.primarySurface,
    borderColor: MOBILE_THEME.primary,
  },
  statusChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#5e6168',
  },
  statusChipTextActive: {
    color: MOBILE_THEME.primaryText,
  },
  feedbackBanner: {
    borderRadius: 18,
    backgroundColor: '#e7f5ec',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackBannerError: {
    backgroundColor: '#fff0ef',
  },
  feedbackText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#1a6a43',
  },
  feedbackTextError: {
    color: '#b94136',
  },
  previewStage: {
    minHeight: 760,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  previewCanvas: {
    width: '100%',
    height: 760,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  previewWebview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  actionItem: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  sendButton: {
    height: 48,
    borderRadius: 18,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 17, 22, 0.18)',
    paddingHorizontal: 28,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 296,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8f9198',
    textAlign: 'center',
    marginBottom: 18,
  },
  deleteButton: {
    width: '100%',
    height: 46,
    borderRadius: 16,
    backgroundColor: '#ffe8e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#c23b35',
  },
  cancelButton: {
    width: '100%',
    height: 44,
    borderRadius: 16,
    backgroundColor: '#f3f2ef',
    borderWidth: 1,
    borderColor: '#e7e4dd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#171717',
  },
  sheetCopy: {
    gap: 8,
  },
  sheetLead: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6f727a',
  },
  sheetMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  selectGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6f727a',
  },
  selectField: {
    height: 46,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e4dd',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#171717',
  },
  selectFieldPlaceholder: {
    color: '#b0b2b8',
    fontWeight: '500',
  },
  sheetError: {
    fontSize: 12,
    lineHeight: 16,
    color: '#c23b35',
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
  optionList: {
    gap: 10,
  },
  optionRow: {
    height: 48,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e4dd',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowActive: {
    borderColor: MOBILE_THEME.primary,
    backgroundColor: MOBILE_THEME.primarySurface,
  },
  optionLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#171717',
  },
  optionLabelActive: {
    color: MOBILE_THEME.primaryText,
  },
});
