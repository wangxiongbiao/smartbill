import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { MOBILE_THEME } from '@/shared/mobile-theme';
import {
  getInputKeyboardProps,
  sanitizeInputValue,
  type InputFilter,
} from './inputFilters';

export function TopActionButton({
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

export function SectionCard({
  title,
  summary,
  onPress,
}: {
  title: string;
  summary: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.sectionCard}>
      <Pressable onPress={onPress} style={styles.sectionHeader}>
        <View style={styles.sectionHeaderCopy}>
          <Text allowFontScaling={false} style={styles.sectionHeaderTitle}>
            {title}
          </Text>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.sectionHeaderSummary}>
            {summary}
          </Text>
        </View>

        <View style={styles.sectionHeaderRight}>
          <Text allowFontScaling={false} style={styles.sectionHeaderAction}>
            Edit
          </Text>
          <Feather color="#8f9198" name="chevron-right" size={18} strokeWidth={2.3} />
        </View>
      </Pressable>
    </View>
  );
}

export function BottomSheetEditor({
  children,
  title,
  visible,
  onClose,
  bottomInset,
  scrollEnabled = true,
}: {
  children: React.ReactNode;
  title: string;
  visible: boolean;
  onClose: () => void;
  bottomInset: number;
  scrollEnabled?: boolean;
}) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.sheetOverlay}>
        <Pressable onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetContainer, { paddingBottom: bottomInset + 24 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text allowFontScaling={false} style={styles.sheetTitle}>
              {title}
            </Text>
            <Pressable onPress={onClose} style={styles.sheetCloseButton}>
              <Feather color="#111111" name="x" size={18} strokeWidth={2.5} />
            </Pressable>
          </View>
          <ScrollView
            bounces={scrollEnabled}
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Field({
  inputFilter,
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
}: {
  inputFilter?: InputFilter;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
}) {
  const resolvedFilter = inputFilter || (multiline ? 'multilineText' : 'text');
  const keyboardProps = getInputKeyboardProps(resolvedFilter, multiline);

  return (
    <View style={styles.fieldGroup}>
      <Text allowFontScaling={false} style={styles.fieldLabel}>
        {label}
      </Text>
      <TextInput
        allowFontScaling={false}
        autoCapitalize={keyboardProps.autoCapitalize}
        autoComplete={keyboardProps.autoComplete}
        autoCorrect={keyboardProps.autoCorrect}
        inputMode={keyboardProps.inputMode}
        keyboardType={keyboardType || keyboardProps.keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        onChangeText={(nextValue) =>
          onChangeText(sanitizeInputValue(nextValue, resolvedFilter))
        }
        placeholder={placeholder}
        placeholderTextColor="#b0b2b8"
        returnKeyType={keyboardProps.returnKeyType}
        spellCheck={keyboardProps.spellCheck}
        style={[styles.textField, multiline && styles.textFieldMultiline]}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
      />
    </View>
  );
}

export function ToggleChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toggleChip, active ? styles.toggleChipActive : styles.toggleChipInactive]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.toggleChipText,
          active ? styles.toggleChipTextActive : styles.toggleChipTextInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ActionButton({
  label,
  icon,
  tone = 'light',
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  tone?: 'light' | 'dark';
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, tone === 'dark' && styles.actionButtonDark]}
    >
      {icon ? (
        <Feather
          color={tone === 'dark' ? '#ffffff' : '#161616'}
          name={icon}
          size={14}
          strokeWidth={2.4}
        />
      ) : null}
      <Text
        allowFontScaling={false}
        style={[styles.actionButtonText, tone === 'dark' && styles.actionButtonTextDark]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryMetric}>
      <Text allowFontScaling={false} style={styles.summaryMetricLabel}>
        {label}
      </Text>
      <Text allowFontScaling={false} style={styles.summaryMetricValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  topButtonWide: {
    minWidth: 110,
  },
  topButtonDark: {
    minWidth: 100,
    backgroundColor: MOBILE_THEME.primary,
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
  sectionCard: {
    borderRadius: 22,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.035,
    shadowRadius: 24,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  sectionHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111111',
  },
  sectionHeaderSummary: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8f9198',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderAction: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#8f9198',
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 10, 10, 0.18)',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#ffffff',
    paddingTop: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 12,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#d6d5d2',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefee',
  },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f2ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: '#fff',
  },
  textField: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: '#f7f6f4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 18,
    color: '#111111',
  },
  textFieldMultiline: {
    minHeight: 94,
  },
  toggleChip: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleChipActive: {
    backgroundColor: MOBILE_THEME.primary,
  },
  toggleChipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e3e3e1',
  },
  toggleChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  toggleChipTextActive: {
    color: '#ffffff',
  },
  toggleChipTextInactive: {
    color: '#171717',
  },
  actionButton: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f0',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonDark: {
    backgroundColor: MOBILE_THEME.primary,
  },
  actionButtonText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#171717',
  },
  actionButtonTextDark: {
    color: '#ffffff',
  },
  summaryMetric: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: MOBILE_THEME.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  summaryMetricLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: '#dbeafe',
  },
  summaryMetricValue: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
