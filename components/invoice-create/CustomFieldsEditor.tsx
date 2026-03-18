import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CustomField } from '@/shared/types';

import { ActionButton } from './shared';

export function CustomFieldsEditor({
  addLabel,
  emptyLabel,
  fields,
  itemLabel,
  labelPlaceholder,
  onAdd,
  onRemove,
  onUpdate,
  valuePlaceholder,
}: {
  addLabel: string;
  emptyLabel: string;
  fields: CustomField[];
  itemLabel: string;
  labelPlaceholder?: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: 'label' | 'value', value: string) => void;
  valuePlaceholder?: string;
}) {
  return (
    <View style={styles.block}>
      <Text allowFontScaling={false} style={styles.blockTitle}>
        Custom fields
      </Text>

      {fields.length === 0 ? (
        <Text allowFontScaling={false} style={styles.emptyText}>
          {emptyLabel}
        </Text>
      ) : null}

      {fields.map((field) => (
        <View key={field.id} style={styles.card}>
          <View style={styles.header}>
            <Text allowFontScaling={false} style={styles.itemTitle}>
              {itemLabel}
            </Text>
            <Pressable onPress={() => onRemove(field.id)} style={styles.iconOnlyButton}>
              <Feather color="#6a6d75" name="x" size={14} strokeWidth={2.6} />
            </Pressable>
          </View>
          <View style={styles.editorGrid}>
            <View style={styles.inputGroup}>
              <Text allowFontScaling={false} style={styles.inputLabel}>
                Label
              </Text>
              <TextInput
                allowFontScaling={false}
                onChangeText={(value) => onUpdate(field.id, 'label', value)}
                placeholder={labelPlaceholder || 'Field label'}
                placeholderTextColor="#b0b2b8"
                style={styles.textField}
                value={field.label}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text allowFontScaling={false} style={styles.inputLabel}>
                Value
              </Text>
              <TextInput
                allowFontScaling={false}
                multiline
                numberOfLines={3}
                onChangeText={(value) => onUpdate(field.id, 'value', value)}
                placeholder={valuePlaceholder || 'Field value'}
                placeholderTextColor="#b0b2b8"
                style={[styles.textField, styles.textFieldMultiline]}
                textAlignVertical="top"
                value={field.value}
              />
            </View>
          </View>
        </View>
      ))}

      <ActionButton icon="plus" label={addLabel} onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 10,
  },
  blockTitle: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8f9198',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#fbfaf8',
    borderWidth: 1,
    borderColor: '#ece9e3',
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#63666f',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconOnlyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f2efea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorGrid: {
    gap: 10,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: '#8f9198',
    paddingHorizontal: 4,
  },
  textField: {
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ece9e3',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 18,
    color: '#111111',
  },
  textFieldMultiline: {
    minHeight: 88,
  },
});
