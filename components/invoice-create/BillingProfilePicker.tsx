import Feather from '@expo/vector-icons/Feather';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { matchesBillingProfile } from '@/shared/billing-profiles';
import { MOBILE_THEME } from '@/shared/mobile-theme';
import type { BillingProfile, BillingProfileKind } from '@/shared/types';
import { getInputKeyboardProps, sanitizeInputValue } from './inputFilters';

function getCopy(kind: BillingProfileKind) {
  return {
    title: kind === 'sender' ? 'Saved bill-from profiles' : 'Saved bill-to profiles',
    empty:
      kind === 'sender' ? 'No saved bill-from profiles yet' : 'No saved bill-to profiles yet',
    action: kind === 'sender' ? 'Choose bill-from profile' : 'Choose bill-to profile',
    hint:
      kind === 'sender'
        ? 'Select from previous sender info'
        : 'Select from previous client info',
    search: 'Search saved profiles',
    defaultBadge: 'Default',
  };
}

export function BillingProfilePicker({
  currentValue,
  kind,
  profiles,
  onSelect,
  selectedProfileKey,
}: {
  currentValue: string;
  kind: BillingProfileKind;
  profiles: BillingProfile[];
  onSelect: (profile: BillingProfile) => void;
  selectedProfileKey?: string;
}) {
  const insets = useSafeAreaInsets();
  const copy = getCopy(kind);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const searchKeyboardProps = getInputKeyboardProps('search');

  const filteredProfiles = useMemo(() => {
    if (!query.trim()) {
      return profiles.slice(0, 12);
    }

    return profiles.filter((profile) => matchesBillingProfile(profile, query)).slice(0, 12);
  }, [profiles, query]);
  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileKey) || null,
    [profiles, selectedProfileKey]
  );

  const openPicker = () => {
    setQuery(currentValue.trim());
    setVisible(true);
  };

  return (
    <>
      <Pressable onPress={openPicker} style={styles.trigger}>
        <View style={styles.triggerCopy}>
          <Text allowFontScaling={false} style={styles.triggerTitle}>
            {activeProfile ? activeProfile.name || copy.action : copy.action}
          </Text>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.triggerHint}>
            {activeProfile
              ? [activeProfile.email, activeProfile.phone].filter(Boolean).join(' · ') ||
              activeProfile.address ||
              `${profiles.length} saved profiles`
              : profiles.length > 0
                ? `${profiles.length} saved profiles`
                : copy.hint}
          </Text>
        </View>
        <Feather color="#8f9198" name="chevron-right" size={18} strokeWidth={2.3} />
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        transparent
        visible={visible}
      >
        <View style={styles.overlay}>
          <Pressable onPress={() => setVisible(false)} style={styles.backdrop} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text allowFontScaling={false} style={styles.title}>
                {copy.title}
              </Text>
              <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
                <Feather color="#111111" name="x" size={18} strokeWidth={2.5} />
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Feather color="#9aa0a8" name="search" size={15} strokeWidth={2.4} />
              <TextInput
                allowFontScaling={false}
                autoCapitalize={searchKeyboardProps.autoCapitalize}
                autoComplete={searchKeyboardProps.autoComplete}
                autoCorrect={searchKeyboardProps.autoCorrect}
                inputMode={searchKeyboardProps.inputMode}
                keyboardType={searchKeyboardProps.keyboardType}
                onChangeText={(value) => setQuery(sanitizeInputValue(value, 'search'))}
                placeholder={copy.search}
                placeholderTextColor="#b0b2b8"
                returnKeyType={searchKeyboardProps.returnKeyType}
                spellCheck={searchKeyboardProps.spellCheck}
                style={styles.searchInput}
                value={query}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredProfiles.length === 0 ? (
                <Text allowFontScaling={false} style={styles.emptyText}>
                  {copy.empty}
                </Text>
              ) : (
                filteredProfiles.map((profile) => (
                  <Pressable
                    key={profile.id}
                    onPress={() => {
                      onSelect(profile);
                      setVisible(false);
                    }}
                    style={[
                      styles.profileCard,
                      profile.id === selectedProfileKey && styles.profileCardActive,
                    ]}
                  >
                    <View style={styles.profileTitleRow}>
                      <Text allowFontScaling={false} numberOfLines={1} style={styles.profileName}>
                        {profile.name || profile.email || profile.phone || profile.address}
                      </Text>
                      <View style={styles.profileBadges}>
                        {kind === 'sender' && profile.isDefault ? (
                          <View style={styles.badge}>
                            <Text allowFontScaling={false} style={styles.badgeText}>
                              {copy.defaultBadge}
                            </Text>
                          </View>
                        ) : null}
                        {profile.id === selectedProfileKey ? (
                          <Feather color="#111111" name="check" size={16} strokeWidth={2.5} />
                        ) : null}
                      </View>
                    </View>

                    {profile.email || profile.phone ? (
                      <Text allowFontScaling={false} numberOfLines={1} style={styles.profileMeta}>
                        {[profile.email, profile.phone].filter(Boolean).join(' · ')}
                      </Text>
                    ) : null}

                    {profile.address ? (
                      <Text
                        allowFontScaling={false}
                        numberOfLines={2}
                        style={styles.profileAddress}
                      >
                        {profile.address}
                      </Text>
                    ) : null}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#f6f5f2',
    borderWidth: 1,
    borderColor: '#ece9e3',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  triggerCopy: {
    flex: 1,
    gap: 2,
  },
  triggerTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#111111',
  },
  triggerHint: {
    fontSize: 12,
    lineHeight: 16,
    color: '#8f9198',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  },
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#ffffff',
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#d8d5cf',
    marginBottom: 10,
  },
  header: {
    minHeight: 50,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#efefee',
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f2ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: '#f7f6f4',
    marginHorizontal: 18,
    marginTop: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: '#111111',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#8f9198',
    paddingVertical: 10,
  },
  profileCard: {
    borderRadius: 18,
    backgroundColor: '#faf9f7',
    borderWidth: 1,
    borderColor: '#ece9e3',
    padding: 14,
    gap: 4,
  },
  profileCardActive: {
    borderColor: MOBILE_THEME.primary,
    backgroundColor: MOBILE_THEME.primarySurface,
  },
  profileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#111111',
  },
  badge: {
    borderRadius: 999,
    backgroundColor: MOBILE_THEME.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: MOBILE_THEME.primaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  profileMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666a73',
  },
  profileAddress: {
    fontSize: 12,
    lineHeight: 17,
    color: '#969aa2',
  },
});
