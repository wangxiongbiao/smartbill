import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { BillingProfile, Invoice } from '@/shared/types';
import { getBillingProfileLookupKey } from '@/shared/billing-profiles';

import { BillingProfilePicker } from './BillingProfilePicker';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { Field } from './shared';

export function SenderSection({
  sender,
  onAddCustomField,
  onApplyProfile,
  onPickLogo,
  onRemoveCustomField,
  onUpdateCustomField,
  onUpdateSender,
  profiles,
}: {
  sender: Invoice['sender'];
  onAddCustomField: () => void;
  onApplyProfile: (profile: BillingProfile) => void;
  onPickLogo: () => void;
  onRemoveCustomField: (id: string) => void;
  onUpdateCustomField: (id: string, key: 'label' | 'value', value: string) => void;
  onUpdateSender: (sender: Invoice['sender']) => void;
  profiles: BillingProfile[];
}) {
  const selectedProfile =
    profiles.find((profile) => getBillingProfileLookupKey('sender', profile) === getBillingProfileLookupKey('sender', sender)) ||
    null;

  return (
    <>
      <View style={styles.mediaBlock}>
        <Text allowFontScaling={false} style={styles.mediaLabel}>
          Logo
        </Text>
        <View style={styles.logoWrap}>
          <Pressable onPress={onPickLogo} style={styles.logoBox}>
            {sender.logo ? (
              <>
                <Image source={{ uri: sender.logo }} style={styles.mediaPreview} />
                <View style={styles.logoHintBadge}>
                  <Text allowFontScaling={false} style={styles.logoHintText}>
                    Tap to replace
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Feather color="#8f9198" name="upload" size={18} strokeWidth={2.3} />
                <Text allowFontScaling={false} style={styles.mediaPlaceholderTitle}>
                  Upload logo
                </Text>
                <Text allowFontScaling={false} style={styles.mediaPlaceholderText}>
                  Tap to add your brand mark
                </Text>
              </View>
            )}
          </Pressable>
          {sender.logo ? (
            <Pressable
              hitSlop={10}
              onPress={() =>
                onUpdateSender({
                  ...sender,
                  logo: undefined,
                })
              }
              style={styles.removeButton}
            >
              <Feather color="#111111" name="x" size={14} strokeWidth={2.8} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <BillingProfilePicker
        currentValue={sender.name}
        kind="sender"
        onSelect={onApplyProfile}
        profiles={profiles}
        selectedProfileKey={selectedProfile?.id}
      />

      <Field
        inputFilter="text"
        label="Name"
        onChangeText={(value) =>
          onUpdateSender({
            ...sender,
            name: value,
          })
        }
        placeholder="Business / personal name"
        value={sender.name}
      />
      <Field
        inputFilter="multilineText"
        label="Address"
        multiline
        onChangeText={(value) =>
          onUpdateSender({
            ...sender,
            address: value,
          })
        }
        placeholder="Address and contact info"
        value={sender.address}
      />
      <View style={styles.stack}>
        <Field
          inputFilter="phone"
          label="Phone"
          keyboardType="phone-pad"
          onChangeText={(value) =>
            onUpdateSender({
              ...sender,
              phone: value,
            })
          }
          placeholder="Phone (Optional)"
          value={sender.phone || ''}
        />
        <Field
          inputFilter="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) =>
            onUpdateSender({
              ...sender,
              email: value,
            })
          }
          placeholder="Email (Optional)"
          value={sender.email}
        />
      </View>

      <CustomFieldsEditor
        addLabel="Add custom field"
        emptyLabel="No sender custom fields yet."
        fields={sender.customFields || []}
        itemLabel="Sender field"
        labelPlaceholder="e.g. Tax ID"
        onAdd={onAddCustomField}
        onRemove={onRemoveCustomField}
        onUpdate={onUpdateCustomField}
        valuePlaceholder="Enter value"
      />
    </>
  );
}

const styles = StyleSheet.create({
  mediaBlock: {
    gap: 8,
  },
  mediaLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
  },
  logoWrap: {
    position: 'relative',
  },
  logoBox: {
    minHeight: 116,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6e3de',
    borderStyle: 'dashed',
    backgroundColor: '#faf9f7',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  mediaPlaceholder: {
    minHeight: 116,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  mediaPlaceholderTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#111111',
  },
  mediaPlaceholderText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8f9198',
  },
  mediaPreview: {
    width: '100%',
    height: 116,
    backgroundColor: '#ffffff',
    resizeMode: 'contain',
  },
  logoHintBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(17, 17, 17, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoHintText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  stack: {
    gap: 10,
  },
});
