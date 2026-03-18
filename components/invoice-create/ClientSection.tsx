import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { BillingProfile, Invoice } from '@/shared/types';
import { getBillingProfileLookupKey } from '@/shared/billing-profiles';

import { BillingProfilePicker } from './BillingProfilePicker';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { Field } from './shared';

export function ClientSection({
  client,
  onAddCustomField,
  onApplyProfile,
  onRemoveCustomField,
  onUpdateClient,
  onUpdateCustomField,
  profiles,
}: {
  client: Invoice['client'];
  onAddCustomField: () => void;
  onApplyProfile: (profile: BillingProfile) => void;
  onRemoveCustomField: (id: string) => void;
  onUpdateClient: (client: Invoice['client']) => void;
  onUpdateCustomField: (id: string, key: 'label' | 'value', value: string) => void;
  profiles: BillingProfile[];
}) {
  const selectedProfile =
    profiles.find((profile) => getBillingProfileLookupKey('client', profile) === getBillingProfileLookupKey('client', client)) ||
    null;

  return (
    <>
      <BillingProfilePicker
        currentValue={client.name}
        kind="client"
        onSelect={onApplyProfile}
        profiles={profiles}
        selectedProfileKey={selectedProfile?.id}
      />

      <Field
        label="Client"
        onChangeText={(value) =>
          onUpdateClient({
            ...client,
            name: value,
          })
        }
        placeholder="Client name"
        value={client.name}
      />
      <Field
        label="Address"
        multiline
        onChangeText={(value) =>
          onUpdateClient({
            ...client,
            address: value,
          })
        }
        placeholder="Client address"
        value={client.address}
      />
      <View style={styles.stack}>
        <Field
          label="Phone"
          keyboardType="phone-pad"
          onChangeText={(value) =>
            onUpdateClient({
              ...client,
              phone: value,
            })
          }
          placeholder="Phone (Optional)"
          value={client.phone || ''}
        />
        <Field
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) =>
            onUpdateClient({
              ...client,
              email: value,
            })
          }
          placeholder="Email (Optional)"
          value={client.email}
        />
      </View>

      <CustomFieldsEditor
        addLabel="Add custom field"
        emptyLabel="No client custom fields yet."
        fields={client.customFields || []}
        itemLabel="Client field"
        labelPlaceholder="e.g. Contact person"
        onAdd={onAddCustomField}
        onRemove={onRemoveCustomField}
        onUpdate={onUpdateCustomField}
        valuePlaceholder="Enter value"
      />
    </>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
});
