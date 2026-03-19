import Feather from '@expo/vector-icons/Feather';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOBILE_THEME } from '@/shared/mobile-theme';
import type { DocumentType, Invoice } from '@/shared/types';

import { Field, ToggleChip } from './shared';

type CurrencyOption = {
  value: string;
  label: string;
};

type CurrencyGroup = {
  label: string;
  options: CurrencyOption[];
};

const CURRENCY_GROUPS: CurrencyGroup[] = [
  {
    label: 'Asia',
    options: [
      { value: 'CNY', label: 'CNY ¥ China' },
      { value: 'JPY', label: 'JPY ¥ Japan' },
      { value: 'HKD', label: 'HKD $ Hong Kong' },
      { value: 'TWD', label: 'TWD $ Taiwan' },
      { value: 'KRW', label: 'KRW ₩ Korea' },
    ],
  },
  {
    label: 'Southeast Asia',
    options: [
      { value: 'SGD', label: 'SGD $ Singapore' },
      { value: 'MYR', label: 'MYR RM Malaysia' },
      { value: 'THB', label: 'THB ฿ Thailand' },
      { value: 'PHP', label: 'PHP ₱ Philippines' },
      { value: 'VND', label: 'VND ₫ Vietnam' },
      { value: 'IDR', label: 'IDR Rp Indonesia' },
    ],
  },
  {
    label: 'North America',
    options: [{ value: 'USD', label: 'USD $ United States' }],
  },
  {
    label: 'Europe',
    options: [
      { value: 'EUR', label: 'EUR € Europe' },
      { value: 'GBP', label: 'GBP £ United Kingdom' },
    ],
  },
  {
    label: 'Oceania',
    options: [
      { value: 'AUD', label: 'AUD $ Australia' },
      { value: 'NZD', label: 'NZD $ New Zealand' },
    ],
  },
];

const COPY = {
  documentType: 'Document Type',
  invoiceMode: 'Invoice Mode',
  receiptMode: 'Receipt Mode',
  date: 'Date',
  dueDate: 'Due Date',
  invoiceNumber: 'Invoice No.',
  receiptNumber: 'Receipt No.',
  currency: 'Currency',
  visibility: 'Visibility',
  showNumber: 'Invoice number',
  showDate: 'Date',
  showDueDate: 'Due date',
  visible: 'Visible',
  hidden: 'Hidden',
};

export function BasicSection({
  invoice,
  onUpdateInvoice,
  onUpdateVisibility,
}: {
  invoice: Invoice;
  onUpdateInvoice: (updates: Partial<Invoice>) => void;
  onUpdateVisibility: (key: string, value: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const [activeDateField, setActiveDateField] = React.useState<'date' | 'dueDate' | null>(null);
  const [currencySheetVisible, setCurrencySheetVisible] = React.useState(false);
  const [pickerValue, setPickerValue] = React.useState(() => parseIsoDate(invoice.date));
  const selectedCurrency =
    CURRENCY_GROUPS.flatMap((group) => group.options).find(
      (option) => option.value === invoice.currency
    ) || null;

  const openDatePicker = (field: 'date' | 'dueDate') => {
    const currentValue = parseIsoDate(invoice[field]);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: currentValue,
        mode: 'date',
        display: 'calendar',
        onChange: (event, selectedDate) => {
          if (event.type !== 'set' || !selectedDate) {
            return;
          }

          onUpdateInvoice({ [field]: toIsoDate(selectedDate) } as Partial<Invoice>);
        },
      });
      return;
    }

    setPickerValue(currentValue);
    setActiveDateField(field);
  };

  const closeDateSheet = () => {
    setActiveDateField(null);
  };

  const confirmDateSheet = () => {
    if (!activeDateField) {
      return;
    }

    onUpdateInvoice({ [activeDateField]: toIsoDate(pickerValue) } as Partial<Invoice>);
    closeDateSheet();
  };

  return (
    <>
      <View style={styles.block}>
        <Text allowFontScaling={false} style={styles.blockTitle}>
          {COPY.documentType}
        </Text>
        <View style={styles.segment}>
          {(['invoice', 'receipt'] as DocumentType[]).map((type) => {
            const selected = invoice.type === type;

            return (
              <Pressable
                key={type}
                onPress={() => onUpdateInvoice({ type })}
                style={[styles.segmentButton, selected && styles.segmentButtonActive]}
              >
                <Text
                  allowFontScaling={false}
                  style={[styles.segmentText, selected && styles.segmentTextActive]}
                >
                  {type === 'invoice' ? COPY.invoiceMode : COPY.receiptMode}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.stack}>
        <DateSelectField
          label={COPY.date}
          onPress={() => openDatePicker('date')}
          value={invoice.date}
        />
        <DateSelectField
          label={COPY.dueDate}
          onPress={() => openDatePicker('dueDate')}
          value={invoice.dueDate}
        />
        <Field
          inputFilter="code"
          label={invoice.type === 'invoice' ? COPY.invoiceNumber : COPY.receiptNumber}
          onChangeText={(value) => onUpdateInvoice({ invoiceNumber: value })}
          placeholder={invoice.type === 'invoice' ? 'Invoice number' : 'Receipt number'}
          value={invoice.invoiceNumber}
        />
      </View>

      <View style={styles.block}>
        <Text allowFontScaling={false} style={styles.blockTitle}>
          {COPY.currency}
        </Text>
        <View style={styles.dropdownWrap}>
          <Pressable
            onPress={() => setCurrencySheetVisible(true)}
            style={[styles.dropdownTrigger, currencySheetVisible && styles.dropdownTriggerActive]}
          >
            <View style={styles.dropdownCopy}>
              <Text allowFontScaling={false} style={styles.dropdownCode}>
                {invoice.currency}
              </Text>
              <Text allowFontScaling={false} numberOfLines={1} style={styles.dropdownValue}>
                {selectedCurrency?.label || invoice.currency}
              </Text>
            </View>
            <Feather
              color="#8f9198"
              name="chevron-down"
              size={18}
              strokeWidth={2.3}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.block}>
        <Text allowFontScaling={false} style={styles.blockTitle}>
          {COPY.visibility}
        </Text>
        <View style={styles.toggleRow}>
          <Text allowFontScaling={false} style={styles.toggleLabel}>
            {COPY.showNumber}
          </Text>
          <ToggleChip
            active={invoice.visibility?.invoiceNumber !== false}
            label={invoice.visibility?.invoiceNumber !== false ? COPY.visible : COPY.hidden}
            onPress={() =>
              onUpdateVisibility('invoiceNumber', !(invoice.visibility?.invoiceNumber !== false))
            }
          />
        </View>
        <View style={styles.toggleRow}>
          <Text allowFontScaling={false} style={styles.toggleLabel}>
            {COPY.showDate}
          </Text>
          <ToggleChip
            active={invoice.visibility?.date !== false}
            label={invoice.visibility?.date !== false ? COPY.visible : COPY.hidden}
            onPress={() => onUpdateVisibility('date', !(invoice.visibility?.date !== false))}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text allowFontScaling={false} style={styles.toggleLabel}>
            {COPY.showDueDate}
          </Text>
          <ToggleChip
            active={invoice.visibility?.dueDate !== false}
            label={invoice.visibility?.dueDate !== false ? COPY.visible : COPY.hidden}
            onPress={() => onUpdateVisibility('dueDate', !(invoice.visibility?.dueDate !== false))}
          />
        </View>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={closeDateSheet}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        transparent
        visible={activeDateField !== null}
      >
        <View style={styles.currencySheetOverlay}>
          <Pressable onPress={closeDateSheet} style={styles.currencySheetBackdrop} />
          <View
            style={[
              styles.currencySheetContainer,
              { paddingBottom: insets.bottom + 14 },
            ]}
          >
            <View style={styles.currencySheetHandle} />
            <View style={styles.currencySheetHeader}>
              <Text allowFontScaling={false} style={styles.currencySheetTitle}>
                {activeDateField === 'dueDate' ? COPY.dueDate : COPY.date}
              </Text>
              <View style={styles.dateSheetActions}>
                <Pressable onPress={closeDateSheet} style={styles.dateSheetTextButton}>
                  <Text allowFontScaling={false} style={styles.dateSheetTextButtonLabel}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable onPress={confirmDateSheet} style={styles.dateSheetDoneButton}>
                  <Text allowFontScaling={false} style={styles.dateSheetDoneButtonLabel}>
                    Done
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.datePickerWrap}>
              <DateTimePicker
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                mode="date"
                onChange={(_, selectedDate) => {
                  if (!selectedDate) {
                    return;
                  }

                  setPickerValue(selectedDate);
                }}
                value={pickerValue}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setCurrencySheetVisible(false)}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        transparent
        visible={currencySheetVisible}
      >
        <View style={styles.currencySheetOverlay}>
          <Pressable
            onPress={() => setCurrencySheetVisible(false)}
            style={styles.currencySheetBackdrop}
          />
          <View
            style={[
              styles.currencySheetContainer,
              { paddingBottom: insets.bottom + 14 },
            ]}
          >
            <View style={styles.currencySheetHandle} />
            <View style={styles.currencySheetHeader}>
              <Text allowFontScaling={false} style={styles.currencySheetTitle}>
                {COPY.currency}
              </Text>
              <Pressable
                onPress={() => setCurrencySheetVisible(false)}
                style={styles.currencySheetCloseButton}
              >
                <Feather color="#111111" name="x" size={18} strokeWidth={2.5} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.currencySheetContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {CURRENCY_GROUPS.map((group) => (
                <View key={group.label} style={styles.dropdownGroup}>
                  <Text allowFontScaling={false} style={styles.dropdownGroupLabel}>
                    {group.label}
                  </Text>
                  {group.options.map((option) => {
                    const selected = option.value === invoice.currency;

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          onUpdateInvoice({ currency: option.value });
                          setCurrencySheetVisible(false);
                        }}
                        style={[styles.dropdownOption, selected && styles.dropdownOptionActive]}
                      >
                        <View style={styles.dropdownOptionCopy}>
                          <Text allowFontScaling={false} style={styles.dropdownOptionCode}>
                            {option.value}
                          </Text>
                          <Text allowFontScaling={false} style={styles.dropdownOptionLabel}>
                            {option.label}
                          </Text>
                        </View>
                        {selected ? (
                          <Feather color="#111111" name="check" size={16} strokeWidth={2.5} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function DateSelectField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text allowFontScaling={false} style={styles.fieldLabel}>
        {label}
      </Text>
      <Pressable onPress={onPress} style={styles.dateFieldButton}>
        <Text allowFontScaling={false} style={styles.dateFieldValue}>
          {value}
        </Text>
        <Feather color="#8f9198" name="calendar" size={16} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map((part) => Number(part));

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    backgroundColor: MOBILE_THEME.primarySoft,
    borderRadius: 20,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#2a2a2a',
  },
  segmentTextActive: {
    fontWeight: '700',
    color: MOBILE_THEME.primaryText,
  },
  stack: {
    gap: 10,
  },
  block: {
    gap: 10,
  },
  blockTitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#7f8188',
    paddingHorizontal: 4,
  },
  dateFieldButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#f7f6f4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateFieldValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#111111',
  },
  dropdownWrap: {
    gap: 10,
  },
  dropdownTrigger: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#f7f6f4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dropdownTriggerActive: {
    borderColor: '#d9d7d3',
    backgroundColor: '#ffffff',
  },
  dropdownCopy: {
    flex: 1,
    gap: 2,
  },
  dropdownCode: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.3,
  },
  dropdownValue: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5f636d',
  },
  dropdownGroup: {
    paddingVertical: 4,
  },
  dropdownGroupLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#8f9198',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dropdownOption: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownOptionActive: {
    backgroundColor: MOBILE_THEME.primarySurface,
  },
  dropdownOptionCopy: {
    flex: 1,
    gap: 2,
  },
  dropdownOptionCode: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  dropdownOptionLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5f636d',
  },
  currencySheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  currencySheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  },
  currencySheetContainer: {
    maxHeight: '72%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#fbfaf8',
    paddingTop: 10,
  },
  currencySheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#d8d5cf',
    marginBottom: 10,
  },
  currencySheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  currencySheetTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  dateSheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateSheetTextButton: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  dateSheetTextButtonLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  dateSheetDoneButton: {
    height: 32,
    borderRadius: 16,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  dateSheetDoneButtonLabel: {
    fontSize: 13,
    lineHeight: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  currencySheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1efeb',
  },
  currencySheetContent: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  datePickerWrap: {
    paddingHorizontal: 10,
    paddingBottom: 4,
    alignItems: 'center',
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
});
