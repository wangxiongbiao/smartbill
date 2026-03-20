import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetEditor } from '@/components/invoice-create/shared';
import { useInvoiceFlow } from '@/shared/invoice-flow';
import {
  buildInvoiceFromTemplateData,
  getMobileTemplates,
  getInvoiceAmount,
} from '@/shared/mobile-hub';
import { MOBILE_THEME } from '@/shared/mobile-theme';
import { TEMPLATE_TYPE_OPTIONS } from '@/shared/template-types';
import type { InvoiceTemplateRecord, TemplateCategory } from '@/shared/types';

function formatAmount(amount: number, currency = 'CNY') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { removeTemplate, savedTemplates, useTemplate } = useInvoiceFlow();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('business');
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplateRecord | null>(null);
  const [busyAction, setBusyAction] = useState<'use' | 'delete' | null>(null);

  const templates = useMemo(() => getMobileTemplates(savedTemplates), [savedTemplates]);
  const activeCategoryLabel =
    TEMPLATE_TYPE_OPTIONS.find((option) => option.value === activeCategory)?.label || 'Business';

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.templateType === activeCategory),
    [activeCategory, templates]
  );

  const handleUseTemplate = async (template: InvoiceTemplateRecord) => {
    try {
      setBusyAction('use');
      await useTemplate(template);
      setSelectedTemplate(null);
      router.push('/create-invoice');
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteTemplate = async (template: InvoiceTemplateRecord) => {
    try {
      setBusyAction('delete');
      await removeTemplate(String(template.id));
      setSelectedTemplate(null);
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 132 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Total templates
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              {templates.length}
            </Text>
          </View>
          <View style={styles.summaryBadge}>
            <Text allowFontScaling={false} style={styles.summaryBadgeText}>
              {activeCategoryLabel}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.categoryRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {TEMPLATE_TYPE_OPTIONS.map((option) => {
            const active = option.value === activeCategory;

            return (
              <Pressable
                key={option.value}
                onPress={() => setActiveCategory(option.value)}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
              >
                <Text
                  allowFontScaling={false}
                  style={[styles.categoryChipText, active && styles.categoryChipTextActive]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredTemplates.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather color="#c6c7cb" name="layers" size={28} strokeWidth={2.1} />
            <Text allowFontScaling={false} style={styles.emptyTitle}>
              No templates here yet
            </Text>
            <Text allowFontScaling={false} style={styles.emptyText}>
              Save a template from invoice detail, then it will appear in this category.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredTemplates.map((template) => {
              const previewInvoice = buildInvoiceFromTemplateData(template.templateData);
              const previewAmount = getInvoiceAmount(previewInvoice);

              return (
                <View key={template.id} style={styles.card}>
                  <View style={styles.cardPreview}>
                    <View style={styles.sheetMini}>
                      <Text allowFontScaling={false} style={styles.sheetMiniType}>
                        {(previewInvoice.type || 'invoice').toUpperCase()}
                      </Text>
                      <Text allowFontScaling={false} numberOfLines={1} style={styles.sheetMiniName}>
                        {previewInvoice.client.name || template.name}
                      </Text>
                      <View style={styles.sheetMiniBar} />
                      <View style={styles.sheetMiniFooter}>
                        <Text allowFontScaling={false} style={styles.sheetMiniCurrency}>
                          {previewInvoice.currency}
                        </Text>
                        <Text allowFontScaling={false} style={styles.sheetMiniAmount}>
                          {formatAmount(previewAmount, previewInvoice.currency)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardMain}>
                        <Text allowFontScaling={false} numberOfLines={1} style={styles.cardTitle}>
                          {template.name}
                        </Text>
                        <Text allowFontScaling={false} numberOfLines={2} style={styles.cardDescription}>
                          {template.description || 'Reusable invoice layout'}
                        </Text>
                      </View>
                      {template.usageCount ? (
                        <View style={styles.usageBadge}>
                          <Feather color="#54657e" name="repeat" size={11} strokeWidth={2.3} />
                          <Text allowFontScaling={false} style={styles.usageBadgeText}>
                            {template.usageCount}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.metaRow}>
                      <Text allowFontScaling={false} style={styles.metaText}>
                        {formatDate(template.updatedAt)}
                      </Text>
                      <Text allowFontScaling={false} style={styles.metaDot}>
                        ·
                      </Text>
                      <Text allowFontScaling={false} style={styles.metaText}>
                        {previewInvoice.currency}
                      </Text>
                      <Text allowFontScaling={false} style={styles.metaDot}>
                        ·
                      </Text>
                      <Text allowFontScaling={false} style={styles.metaText}>
                        {(previewInvoice.type || 'invoice').toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => setSelectedTemplate(template)}
                        style={styles.detailButton}
                      >
                        <Text allowFontScaling={false} style={styles.detailButtonText}>
                          Details
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => void handleUseTemplate(template)}
                        style={styles.useButton}
                      >
                        <Feather color="#ffffff" name="plus" size={14} strokeWidth={2.6} />
                        <Text allowFontScaling={false} style={styles.useButtonText}>
                          Use template
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomSheetEditor
        bottomInset={insets.bottom}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.name || 'Template details'}
        visible={selectedTemplate !== null}
      >
        {selectedTemplate ? (
          <>
            <View style={styles.sheetSummary}>
              <Text allowFontScaling={false} style={styles.sheetSummaryLabel}>
                {selectedTemplate.description || 'Reusable invoice layout'}
              </Text>
              <Text allowFontScaling={false} style={styles.sheetSummaryMeta}>
                Updated {formatDate(selectedTemplate.updatedAt)} · Used {selectedTemplate.usageCount || 0}{' '}
                times
              </Text>
            </View>

            <View style={styles.sheetMetaCard}>
              <Text allowFontScaling={false} style={styles.sheetMetaTitle}>
                {selectedTemplate.templateType}
              </Text>
              <Text allowFontScaling={false} style={styles.sheetMetaText}>
                {(buildInvoiceFromTemplateData(selectedTemplate.templateData).type || 'invoice').toUpperCase()}
              </Text>
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                disabled={busyAction !== null}
                onPress={() => void handleUseTemplate(selectedTemplate)}
                style={[styles.sheetPrimaryButton, busyAction !== null && styles.sheetButtonDisabled]}
              >
                <Text allowFontScaling={false} style={styles.sheetPrimaryButtonText}>
                  {busyAction === 'use' ? 'Preparing...' : 'Use template'}
                </Text>
              </Pressable>

              <Pressable
                disabled={busyAction !== null}
                onPress={() => void handleDeleteTemplate(selectedTemplate)}
                style={[styles.sheetDangerButton, busyAction !== null && styles.sheetButtonDisabled]}
              >
                <Text allowFontScaling={false} style={styles.sheetDangerButtonText}>
                  {busyAction === 'delete' ? 'Deleting...' : 'Delete template'}
                </Text>
              </Pressable>

              <Pressable onPress={() => setSelectedTemplate(null)} style={styles.sheetSecondaryButton}>
                <Text allowFontScaling={false} style={styles.sheetSecondaryButtonText}>
                  Close
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </BottomSheetEditor>
    </SafeAreaView>
  );
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
  summaryCard: {
    borderRadius: 24,
    backgroundColor: MOBILE_THEME.primary,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  summaryBadge: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 10,
  },
  categoryChip: {
    minHeight: 34,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MOBILE_THEME.primarySoft,
  },
  categoryChipActive: {
    backgroundColor: MOBILE_THEME.primary,
  },
  categoryChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: MOBILE_THEME.primaryText,
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    paddingVertical: 42,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#171717',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8d8f96',
    textAlign: 'center',
    maxWidth: 260,
  },
  list: {
    gap: 14,
    marginTop: 2,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  cardPreview: {
    backgroundColor: '#efeeeb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetMini: {
    width: '100%',
    minHeight: 112,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  sheetMiniType: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: '#5d6980',
    marginBottom: 8,
  },
  sheetMiniName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },
  sheetMiniBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dbe5ff',
    marginBottom: 16,
  },
  sheetMiniFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetMiniCurrency: {
    fontSize: 11,
    lineHeight: 14,
    color: '#9a9ca3',
  },
  sheetMiniAmount: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    color: '#111111',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  cardMain: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#171717',
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8d8f96',
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: MOBILE_THEME.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  usageBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: MOBILE_THEME.primaryText,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
    color: '#9a9ca3',
  },
  metaDot: {
    marginHorizontal: 6,
    fontSize: 12,
    lineHeight: 14,
    color: '#c3c4c8',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  detailButton: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#f3f2ef',
    borderWidth: 1,
    borderColor: '#e7e4dd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#171717',
  },
  useButton: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    backgroundColor: MOBILE_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  useButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheetSummary: {
    gap: 6,
  },
  sheetSummaryLabel: {
    fontSize: 14,
    lineHeight: 19,
    color: '#5f636b',
  },
  sheetSummaryMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#8d9098',
  },
  sheetMetaCard: {
    borderRadius: 18,
    backgroundColor: '#f7f6f4',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  sheetMetaTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: MOBILE_THEME.primaryText,
    textTransform: 'capitalize',
  },
  sheetMetaText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#171717',
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
  sheetPrimaryButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheetDangerButton: {
    height: 46,
    borderRadius: 16,
    backgroundColor: '#fff0ef',
    borderWidth: 1,
    borderColor: '#f4d0cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDangerButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#c23b35',
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
  sheetButtonDisabled: {
    opacity: 0.45,
  },
});
