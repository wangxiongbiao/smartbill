import Feather from '@expo/vector-icons/Feather';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BasicSection } from '@/components/invoice-create/BasicSection';
import { ClientSection } from '@/components/invoice-create/ClientSection';
import { SenderSection } from '@/components/invoice-create/SenderSection';
import {
  ActionButton,
  BottomSheetEditor,
  Field,
  SectionCard,
  SummaryMetric,
  ToggleChip,
  TopActionButton,
} from '@/components/invoice-create/shared';
import {
  calculateInvoiceTotals,
  getSortedInvoiceColumns,
  hasPaymentInfoContent,
  updateInvoiceItem,
  updateInvoiceItemAmount,
  updateInvoiceItemCustomValue,
  updatePaymentInfoFieldValue,
} from '@/shared/invoice';
import {
  applyBillingProfileToClient,
  applyBillingProfileToSender,
  deriveBillingProfilesFromInvoices,
} from '@/shared/billing-profiles';
import { useInvoiceFlow } from '@/shared/invoice-flow';
import type {
  BillingProfile,
  CustomField,
  Invoice,
  InvoiceColumn,
  InvoiceItem,
  PaymentInfoField,
} from '@/shared/types';

type SectionKey =
  | 'basic'
  | 'from'
  | 'to'
  | 'items'
  | 'payment'
  | 'signature'
  | 'disclaimer';

const SECTION_TITLES: Record<SectionKey, string> = {
  basic: 'Base',
  from: 'From',
  to: 'To',
  items: 'Items & Summary',
  payment: 'Payment Info',
  signature: 'Signature',
  disclaimer: 'Disclaimer',
};

const signaturePadStyle = `
  .m-signature-pad {
    box-shadow: none;
    border: none;
  }
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px 16px;
    background: #ffffff;
  }
  .m-signature-pad--footer .button {
    background: #171f2d;
    color: #ffffff;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    box-shadow: none;
    padding: 0 16px;
  }
`;

export default function CreateInvoiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signatureRef = useRef<SignatureViewRef>(null);
  const {
    createdInvoices,
    draftInvoice: invoice,
    resetDraftInvoice,
    setDraftInvoice,
    submitDraftInvoice,
  } =
    useInvoiceFlow();
  const [activeSheet, setActiveSheet] = useState<SectionKey | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const totals = useMemo(
    () => calculateInvoiceTotals(invoice.items, invoice.taxRate),
    [invoice.items, invoice.taxRate]
  );
  const sortedColumns = useMemo(
    () => getSortedInvoiceColumns(invoice.columnConfig),
    [invoice.columnConfig]
  );
  const paymentFields = useMemo(
    () => [...(invoice.paymentInfo?.fields || [])].sort((a, b) => a.order - b.order),
    [invoice.paymentInfo?.fields]
  );
  const billingProfiles = useMemo(
    () => deriveBillingProfilesFromInvoices(createdInvoices),
    [createdInvoices]
  );
  const senderProfiles = useMemo(
    () => billingProfiles.filter((profile) => profile.kind === 'sender'),
    [billingProfiles]
  );
  const clientProfiles = useMemo(
    () => billingProfiles.filter((profile) => profile.kind === 'client'),
    [billingProfiles]
  );

  const updateInvoice = (updates: Partial<Invoice>) => {
    setDraftInvoice({ ...invoice, ...updates });
  };

  const openSheet = (key: SectionKey) => {
    setShowSignaturePad(false);
    setActiveSheet(key);
  };

  const closeSheet = () => {
    setShowSignaturePad(false);
    setActiveSheet(null);
  };

  const updateVisibility = (key: string, value: boolean) => {
    updateInvoice({
      visibility: {
        ...invoice.visibility,
        [key]: value,
      },
    });
  };

  const pickImage = async (target: 'logo' | 'qr' | 'signature') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) {
      return;
    }

    const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;

    if (target === 'logo') {
      updateInvoice({
        sender: {
          ...invoice.sender,
          logo: uri,
        },
      });
      return;
    }

    if (target === 'qr') {
      updateInvoice({
        paymentInfo: {
          ...invoice.paymentInfo,
          fields: invoice.paymentInfo?.fields || [],
          qrCode: uri,
        },
      });
      return;
    }

    updateInvoice({
      sender: {
        ...invoice.sender,
        signature: uri,
      },
    });
  };

  const addCustomField = (target: 'sender' | 'client') => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      label: '',
      value: '',
    };

    if (target === 'sender') {
      updateInvoice({
        sender: {
          ...invoice.sender,
          customFields: [...(invoice.sender.customFields || []), newField],
        },
      });
      return;
    }

    updateInvoice({
      client: {
        ...invoice.client,
        customFields: [...(invoice.client.customFields || []), newField],
      },
    });
  };

  const updateCustomField = (
    target: 'sender' | 'client',
    id: string,
    key: 'label' | 'value',
    value: string
  ) => {
    if (target === 'sender') {
      updateInvoice({
        sender: {
          ...invoice.sender,
          customFields:
            invoice.sender.customFields?.map((field) =>
              field.id === id ? { ...field, [key]: value } : field
            ) || [],
        },
      });
      return;
    }

    updateInvoice({
      client: {
        ...invoice.client,
        customFields:
          invoice.client.customFields?.map((field) =>
            field.id === id ? { ...field, [key]: value } : field
          ) || [],
      },
    });
  };

  const removeCustomField = (target: 'sender' | 'client', id: string) => {
    if (target === 'sender') {
      updateInvoice({
        sender: {
          ...invoice.sender,
          customFields: invoice.sender.customFields?.filter((field) => field.id !== id) || [],
        },
      });
      return;
    }

    updateInvoice({
      client: {
        ...invoice.client,
        customFields: invoice.client.customFields?.filter((field) => field.id !== id) || [],
      },
    });
  };

  const applyProfile = (target: 'sender' | 'client', profile: BillingProfile) => {
    if (target === 'sender') {
      updateInvoice({
        sender: applyBillingProfileToSender(invoice.sender, profile),
      });
      return;
    }

    updateInvoice({
      client: applyBillingProfileToClient(invoice.client, profile),
    });
  };

  const addItem = () => {
    updateInvoice({
      items: [
        ...invoice.items,
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          rate: '',
          amount: '',
          customValues: {},
        },
      ],
    });
  };

  const removeItem = (itemId: string) => {
    updateInvoice({
      items: invoice.items.filter((item) => item.id !== itemId),
    });
  };

  const updateItemField = (itemId: string, field: keyof InvoiceItem, value: string) => {
    if (field === 'amount') {
      updateInvoice({
        items: updateInvoiceItemAmount(invoice.items, itemId, value),
      });
      return;
    }

    updateInvoice({
      items: updateInvoiceItem(invoice.items, itemId, {
        [field]: value,
      }),
    });
  };

  const updateItemCustomField = (itemId: string, columnId: string, value: string) => {
    updateInvoice({
      items: updateInvoiceItemCustomValue(invoice.items, itemId, columnId, value),
    });
  };

  const toggleColumnVisibility = (columnId: string) => {
    updateInvoice({
      columnConfig:
        invoice.columnConfig?.map((column) =>
          column.id === columnId ? { ...column, visible: !column.visible } : column
        ) || [],
    });
  };

  const updateColumn = (columnId: string, updates: Partial<InvoiceColumn>) => {
    updateInvoice({
      columnConfig:
        invoice.columnConfig?.map((column) =>
          column.id === columnId ? { ...column, ...updates } : column
        ) || [],
    });
  };

  const addCustomColumn = () => {
    const nextOrder = invoice.columnConfig?.length || 0;
    const newColumn: InvoiceColumn = {
      id: `column-${Date.now()}`,
      field: `customValues.column-${Date.now()}`,
      label: 'Custom field',
      type: 'custom-text',
      order: nextOrder,
      visible: true,
      required: false,
    };

    updateInvoice({
      columnConfig: [...(invoice.columnConfig || []), newColumn],
      items: invoice.items.map((item) => ({
        ...item,
        customValues: {
          ...(item.customValues || {}),
          [newColumn.id]: '',
        },
      })),
    });
  };

  const removeColumn = (columnId: string) => {
    updateInvoice({
      columnConfig: invoice.columnConfig?.filter((column) => column.id !== columnId) || [],
      items: invoice.items.map((item) => {
        const nextValues = { ...(item.customValues || {}) };
        delete nextValues[columnId];

        return {
          ...item,
          customValues: nextValues,
        };
      }),
    });
  };

  const addPaymentField = () => {
    const nextField: PaymentInfoField = {
      id: `payment-${Date.now()}`,
      label: 'Custom payment field',
      type: 'textarea',
      order: paymentFields.length,
      visible: true,
      required: false,
      value: '',
    };

    updateInvoice({
      paymentInfo: {
        ...invoice.paymentInfo,
        fields: [...paymentFields, nextField],
      },
    });
  };

  const updatePaymentField = (
    fieldId: string,
    key: 'label' | 'value' | 'visible',
    value: string | boolean
  ) => {
    updateInvoice({
      paymentInfo: {
        ...invoice.paymentInfo,
        fields:
          paymentFields.map((field) =>
            field.id === fieldId ? { ...field, [key]: value } : field
          ) || [],
      },
    });
  };

  const removePaymentField = (fieldId: string) => {
    updateInvoice({
      paymentInfo: {
        ...invoice.paymentInfo,
        fields: paymentFields.filter((field) => field.id !== fieldId),
      },
    });
  };

  const handleSignature = (signature: string) => {
    updateInvoice({
      sender: {
        ...invoice.sender,
        signature,
      },
    });
    setShowSignaturePad(false);
  };

  const clearSignature = () => {
    signatureRef.current?.clearSignature();
    updateInvoice({
      sender: {
        ...invoice.sender,
        signature: undefined,
      },
    });
  };

  const basicSummary = `${capitalize(invoice.type)} · ${invoice.date} · ${invoice.currency} · ${invoice.invoiceNumber}`;
  const fromSummary = invoice.sender.name || invoice.sender.email || 'No sender yet';
  const toSummary = invoice.client.name || invoice.client.email || 'No client yet';
  const itemsSummary = `${invoice.items.length} item${invoice.items.length > 1 ? 's' : ''} · ${formatMoney(
    invoice.currency,
    totals.total
  )}`;
  const paymentSummary = invoice.visibility?.paymentInfo
    ? `${paymentFields.filter((field) => field.visible).length} fields${
        hasPaymentInfoContent(invoice.paymentInfo) ? ' · ready' : ''
      }`
    : 'Off';
  const signatureSummary = invoice.visibility?.signature
    ? invoice.sender.signature
      ? 'Added'
      : 'Waiting for signature'
    : 'Off';
  const disclaimerSummary = invoice.visibility?.disclaimer
    ? invoice.sender.disclaimerText || 'Visible'
    : 'Off';

  const handleCancel = () => {
    resetDraftInvoice();
    router.back();
  };

  const handleSubmit = () => {
    submitDraftInvoice();
    router.replace('/(tabs)');
  };

  const renderSheetContent = () => {
    switch (activeSheet) {
      case 'basic':
        return (
          <BasicSection
            invoice={invoice}
            onUpdateInvoice={updateInvoice}
            onUpdateVisibility={updateVisibility}
          />
        );

      case 'from':
        return (
          <SenderSection
            onAddCustomField={() => addCustomField('sender')}
            onApplyProfile={(profile) => applyProfile('sender', profile)}
            onPickLogo={() => pickImage('logo')}
            onRemoveCustomField={(id) => removeCustomField('sender', id)}
            onUpdateCustomField={(id, key, value) =>
              updateCustomField('sender', id, key, value)
            }
            onUpdateSender={(sender) => updateInvoice({ sender })}
            profiles={senderProfiles}
            sender={invoice.sender}
          />
        );

      case 'to':
        return (
          <ClientSection
            client={invoice.client}
            onAddCustomField={() => addCustomField('client')}
            onApplyProfile={(profile) => applyProfile('client', profile)}
            onRemoveCustomField={(id) => removeCustomField('client', id)}
            onUpdateClient={(client) => updateInvoice({ client })}
            onUpdateCustomField={(id, key, value) =>
              updateCustomField('client', id, key, value)
            }
            profiles={clientProfiles}
          />
        );

      case 'items':
        return (
          <>
            <View style={styles.block}>
              <View style={styles.blockHeaderRow}>
                <Text allowFontScaling={false} style={styles.blockTitle}>
                  Columns
                </Text>
                <ActionButton icon="plus" label="Add column" onPress={addCustomColumn} />
              </View>

              {sortedColumns.map((column) => (
                <View key={column.id} style={styles.configRow}>
                  <View style={styles.configCopy}>
                    <TextInput
                      allowFontScaling={false}
                      onChangeText={(value) => updateColumn(column.id, { label: value })}
                      placeholder="Column label"
                      placeholderTextColor="#b0b2b8"
                      style={styles.configInput}
                      value={column.label}
                    />
                    <Text allowFontScaling={false} style={styles.configMeta}>
                      {column.type}
                    </Text>
                  </View>

                  <View style={styles.configActions}>
                    <ToggleChip
                      active={column.visible}
                      label={column.visible ? 'Shown' : 'Hidden'}
                      onPress={() => toggleColumnVisibility(column.id)}
                    />
                    {!column.required ? (
                      <>
                        <ActionButton
                          icon="refresh-cw"
                          label={column.type === 'custom-text' ? 'Text' : 'Number'}
                          onPress={() =>
                            updateColumn(column.id, {
                              type: column.type === 'custom-text' ? 'custom-number' : 'custom-text',
                            })
                          }
                        />
                        <Pressable onPress={() => removeColumn(column.id)} style={styles.iconOnlyButton}>
                          <Feather color="#6a6d75" name="trash-2" size={15} strokeWidth={2.3} />
                        </Pressable>
                      </>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.block}>
              <View style={styles.blockHeaderRow}>
                <Text allowFontScaling={false} style={styles.blockTitle}>
                  Items
                </Text>
                <ActionButton icon="plus" label="Add item" onPress={addItem} />
              </View>

              {invoice.items.map((item, index) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemCardHeader}>
                    <Text allowFontScaling={false} style={styles.itemCardTitle}>
                      Item {index + 1}
                    </Text>
                    {invoice.items.length > 1 ? (
                      <Pressable onPress={() => removeItem(item.id)} style={styles.iconOnlyButton}>
                        <Feather color="#6a6d75" name="trash-2" size={15} strokeWidth={2.3} />
                      </Pressable>
                    ) : null}
                  </View>

                  {sortedColumns.map((column) => {
                    if (column.type === 'system-text') {
                      return (
                        <Field
                          key={column.id}
                          label={column.label}
                          multiline
                          onChangeText={(value) => updateItemField(item.id, 'description', value)}
                          value={String(item.description || '')}
                        />
                      );
                    }

                    if (column.type === 'system-quantity') {
                      return (
                        <Field
                          key={column.id}
                          keyboardType="numeric"
                          label={column.label}
                          onChangeText={(value) => updateItemField(item.id, 'quantity', value)}
                          value={stringifyValue(item.quantity)}
                        />
                      );
                    }

                    if (column.type === 'system-rate') {
                      return (
                        <Field
                          key={column.id}
                          keyboardType="numeric"
                          label={column.label}
                          onChangeText={(value) => updateItemField(item.id, 'rate', value)}
                          value={stringifyValue(item.rate)}
                        />
                      );
                    }

                    if (column.type === 'system-amount') {
                      return (
                        <Field
                          key={column.id}
                          keyboardType="numeric"
                          label={column.label}
                          onChangeText={(value) => updateItemField(item.id, 'amount', value)}
                          value={stringifyValue(item.amount)}
                        />
                      );
                    }

                    return (
                      <Field
                        key={column.id}
                        keyboardType={column.type === 'custom-number' ? 'numeric' : 'default'}
                        label={column.label}
                        multiline={column.type === 'custom-text'}
                        onChangeText={(value) => updateItemCustomField(item.id, column.id, value)}
                        value={String(item.customValues?.[column.id] || '')}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.totalCard}>
              <View style={styles.totalCardTop}>
                <Field
                  keyboardType="numeric"
                  label="Tax rate %"
                  onChangeText={(value) =>
                    updateInvoice({
                      taxRate: Number(value || 0),
                    })
                  }
                  value={String(invoice.taxRate)}
                />
              </View>

              <View style={styles.metricsRow}>
                <SummaryMetric label="Subtotal" value={formatMoney(invoice.currency, totals.subtotal)} />
                <SummaryMetric label="Tax" value={formatMoney(invoice.currency, totals.tax)} />
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalFooter}>
                <Text allowFontScaling={false} style={styles.totalFooterLabel}>
                  Total
                </Text>
                <Text allowFontScaling={false} style={styles.totalFooterValue}>
                  {formatMoney(invoice.currency, totals.total)}
                </Text>
              </View>
            </View>
          </>
        );

      case 'payment':
        return (
          <>
            <View style={styles.toggleRow}>
              <Text allowFontScaling={false} style={styles.toggleLabel}>
                Show payment info
              </Text>
              <ToggleChip
                active={invoice.visibility?.paymentInfo === true}
                label={invoice.visibility?.paymentInfo === true ? 'On' : 'Off'}
                onPress={() =>
                  updateVisibility('paymentInfo', !(invoice.visibility?.paymentInfo === true))
                }
              />
            </View>

            {invoice.visibility?.paymentInfo === true ? (
              <>
                <View style={styles.mediaCard}>
                  <Text allowFontScaling={false} style={styles.mediaLabel}>
                    Payment QR Code
                  </Text>
                  {invoice.paymentInfo?.qrCode ? (
                    <Image source={{ uri: invoice.paymentInfo.qrCode }} style={styles.qrPreview} />
                  ) : (
                    <View style={styles.mediaPlaceholder}>
                      <Feather color="#a6a8af" name="grid" size={16} strokeWidth={2.3} />
                      <Text allowFontScaling={false} style={styles.mediaPlaceholderText}>
                        No QR code yet
                      </Text>
                    </View>
                  )}
                  <View style={styles.actionRow}>
                    <ActionButton
                      icon="upload"
                      label={invoice.paymentInfo?.qrCode ? 'Change QR' : 'Upload QR'}
                      onPress={() => pickImage('qr')}
                    />
                    {invoice.paymentInfo?.qrCode ? (
                      <ActionButton
                        icon="trash-2"
                        label="Remove"
                        onPress={() =>
                          updateInvoice({
                            paymentInfo: {
                              ...invoice.paymentInfo,
                              fields: invoice.paymentInfo?.fields || [],
                              qrCode: undefined,
                            },
                          })
                        }
                      />
                    ) : null}
                  </View>
                </View>

                <View style={styles.block}>
                  <View style={styles.blockHeaderRow}>
                    <Text allowFontScaling={false} style={styles.blockTitle}>
                      Payment fields
                    </Text>
                    <ActionButton icon="plus" label="Add field" onPress={addPaymentField} />
                  </View>

                  {paymentFields.map((field) => (
                    <View key={field.id} style={styles.paymentFieldCard}>
                      <View style={styles.paymentFieldHeader}>
                        <Text allowFontScaling={false} style={styles.paymentFieldTitle}>
                          {field.required ? 'System field' : 'Custom field'}
                        </Text>
                        <View style={styles.configActions}>
                          <ToggleChip
                            active={field.visible}
                            label={field.visible ? 'Shown' : 'Hidden'}
                            onPress={() => updatePaymentField(field.id, 'visible', !field.visible)}
                          />
                          {!field.required ? (
                            <Pressable
                              onPress={() => removePaymentField(field.id)}
                              style={styles.iconOnlyButton}
                            >
                              <Feather color="#6a6d75" name="trash-2" size={15} strokeWidth={2.3} />
                            </Pressable>
                          ) : null}
                        </View>
                      </View>

                      <Field
                        label="Label"
                        onChangeText={(value) => updatePaymentField(field.id, 'label', value)}
                        value={field.label}
                      />
                      <Field
                        label="Value"
                        multiline={field.type === 'textarea'}
                        onChangeText={(value) =>
                          updateInvoice({
                            paymentInfo: updatePaymentInfoFieldValue(
                              invoice.paymentInfo,
                              field.id,
                              value
                            ),
                          })
                        }
                        value={field.value}
                      />
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </>
        );

      case 'signature':
        return (
          <>
            <View style={styles.toggleRow}>
              <Text allowFontScaling={false} style={styles.toggleLabel}>
                Show signature
              </Text>
              <ToggleChip
                active={invoice.visibility?.signature === true}
                label={invoice.visibility?.signature === true ? 'On' : 'Off'}
                onPress={() => updateVisibility('signature', !(invoice.visibility?.signature === true))}
              />
            </View>

            {invoice.visibility?.signature === true ? (
              <>
                <View style={styles.actionRow}>
                  <ActionButton icon="upload" label="Upload image" onPress={() => pickImage('signature')} />
                  <ActionButton
                    icon="edit-3"
                    label={showSignaturePad ? 'Hide pad' : 'Draw'}
                    onPress={() => setShowSignaturePad((current) => !current)}
                  />
                  {invoice.sender.signature ? (
                    <ActionButton icon="trash-2" label="Clear" onPress={clearSignature} />
                  ) : null}
                </View>

                {invoice.sender.signature ? (
                  <View style={styles.signaturePreviewCard}>
                    <Image source={{ uri: invoice.sender.signature }} style={styles.signaturePreview} />
                  </View>
                ) : (
                  <View style={styles.mediaPlaceholder}>
                    <Feather color="#a6a8af" name="edit-3" size={16} strokeWidth={2.3} />
                    <Text allowFontScaling={false} style={styles.mediaPlaceholderText}>
                      No signature yet
                    </Text>
                  </View>
                )}

                {showSignaturePad ? (
                  <View style={styles.signaturePadWrap}>
                    <SignatureScreen
                      ref={signatureRef}
                      autoClear={false}
                      backgroundColor="#ffffff"
                      confirmText="Save"
                      clearText="Clear"
                      descriptionText="Draw your signature"
                      onEmpty={() => undefined}
                      onOK={handleSignature}
                      webStyle={signaturePadStyle}
                    />
                  </View>
                ) : null}
              </>
            ) : null}
          </>
        );

      case 'disclaimer':
        return (
          <>
            <View style={styles.toggleRow}>
              <Text allowFontScaling={false} style={styles.toggleLabel}>
                Show disclaimer
              </Text>
              <ToggleChip
                active={invoice.visibility?.disclaimer !== false}
                label={invoice.visibility?.disclaimer !== false ? 'On' : 'Off'}
                onPress={() => updateVisibility('disclaimer', invoice.visibility?.disclaimer === false)}
              />
            </View>

            {invoice.visibility?.disclaimer !== false ? (
              <Field
                label="Text"
                multiline
                onChangeText={(value) =>
                  updateInvoice({
                    sender: {
                      ...invoice.sender,
                      disclaimerText: value,
                    },
                  })
                }
                value={invoice.sender.disclaimerText || ''}
              />
            ) : null}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 168 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <TopActionButton label="Cancel" onPress={handleCancel} wide />

            <View style={styles.topRightActions}>
              <TopActionButton label="Preview" onPress={() => router.push('/invoice-preview')} wide />
              <TopActionButton dark label="Done" onPress={handleSubmit} />
            </View>
          </View>

          <Text allowFontScaling={false} style={styles.title}>
            New invoice
          </Text>

          <SectionCard
            onPress={() => openSheet('basic')}
            summary={basicSummary}
            title="Base"
          />

          <SectionCard
            onPress={() => openSheet('from')}
            summary={fromSummary}
            title="From"
          />

          <SectionCard
            onPress={() => openSheet('to')}
            summary={toSummary}
            title="To"
          />

          <SectionCard
            onPress={() => openSheet('items')}
            summary={itemsSummary}
            title="Items & Summary"
          />

          <SectionCard
            onPress={() => openSheet('payment')}
            summary={paymentSummary}
            title="Payment Info"
          />

          <SectionCard
            onPress={() => openSheet('signature')}
            summary={signatureSummary}
            title="Signature"
          />

          <SectionCard
            onPress={() => openSheet('disclaimer')}
            summary={disclaimerSummary}
            title="Disclaimer"
          />
        </ScrollView>

        <View style={[styles.bottomDock, { paddingBottom: insets.bottom + 10 }]}>
          <Pressable onPress={handleSubmit} style={styles.submitButton}>
            <Text allowFontScaling={false} style={styles.submitButtonText}>
              Create Invoice
            </Text>
          </Pressable>
        </View>

        <BottomSheetEditor
          bottomInset={insets.bottom}
          onClose={closeSheet}
          title={activeSheet ? SECTION_TITLES[activeSheet] : ''}
          visible={activeSheet !== null}
        >
          {renderSheetContent()}
        </BottomSheetEditor>
      </View>
    </SafeAreaView>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function stringifyValue(value: number | string | undefined) {
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
    gap: 12,
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
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#050505',
    textAlign: 'center',
    marginBottom: 4,
  },
  block: {
    gap: 10,
  },
  blockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  blockTitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleRow: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: '#f7f6f4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: '#111111',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mediaCard: {
    borderRadius: 18,
    backgroundColor: '#f7f6f4',
    padding: 14,
    gap: 12,
  },
  mediaLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#111111',
  },
  mediaPlaceholder: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dfdeda',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
  },
  mediaPlaceholderText: {
    fontSize: 12,
    lineHeight: 15,
    color: '#9a9ca3',
  },
  mediaPreview: {
    width: '100%',
    height: 110,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    resizeMode: 'contain',
  },
  qrPreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    resizeMode: 'contain',
  },
  customFieldCard: {
    borderRadius: 18,
    backgroundColor: '#f7f6f4',
    padding: 14,
    gap: 12,
  },
  customFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customFieldTitle: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#111111',
  },
  iconOnlyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  configRow: {
    borderRadius: 18,
    backgroundColor: '#f7f6f4',
    padding: 14,
    gap: 10,
  },
  configCopy: {
    gap: 4,
  },
  configInput: {
    minHeight: 38,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight: 18,
    color: '#111111',
  },
  configMeta: {
    fontSize: 11,
    lineHeight: 14,
    color: '#8f9198',
  },
  configActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  itemCard: {
    borderRadius: 18,
    backgroundColor: '#f7f6f4',
    padding: 14,
    gap: 12,
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCardTitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  totalCard: {
    borderRadius: 20,
    backgroundColor: '#171f2d',
    padding: 16,
    gap: 14,
  },
  totalCardTop: {
    borderRadius: 16,
    backgroundColor: '#253045',
    padding: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#334056',
  },
  totalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalFooterLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  totalFooterValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  paymentFieldCard: {
    borderRadius: 18,
    backgroundColor: '#f7f6f4',
    padding: 14,
    gap: 12,
  },
  paymentFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentFieldTitle: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#111111',
  },
  signaturePreviewCard: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  signaturePreview: {
    width: '100%',
    height: 88,
    resizeMode: 'contain',
  },
  signaturePadWrap: {
    overflow: 'hidden',
    borderRadius: 20,
    height: 280,
    backgroundColor: '#ffffff',
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
