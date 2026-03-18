import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInvoiceFlow } from '@/shared/invoice-flow';
import {
  buildInvoiceFromTemplateData,
  createDraftInvoiceFromTemplate,
  getMobileTemplates,
  getInvoiceAmount,
} from '@/shared/mobile-hub';
import { TEMPLATE_TYPE_OPTIONS } from '@/shared/template-types';
import type { TemplateCategory } from '@/shared/types';

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
  const { savedTemplates, setDraftInvoice } = useInvoiceFlow();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('business');

  const templates = useMemo(() => getMobileTemplates(savedTemplates), [savedTemplates]);
  const activeCategoryLabel =
    TEMPLATE_TYPE_OPTIONS.find((option) => option.value === activeCategory)?.label || 'Business';

  const filteredTemplates = useMemo(
    () => templates.filter((template) => template.templateType === activeCategory),
    [activeCategory, templates]
  );

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setDraftInvoice(createDraftInvoiceFromTemplate(template));
    router.push('/create-invoice');
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

                    <Pressable
                      onPress={() => handleUseTemplate(template.id)}
                      style={styles.useButton}
                    >
                      <Feather color="#ffffff" name="plus" size={14} strokeWidth={2.6} />
                      <Text allowFontScaling={false} style={styles.useButtonText}>
                        Use template
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#171f2d',
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
    backgroundColor: '#ecebea',
  },
  categoryChipActive: {
    backgroundColor: '#171f2d',
  },
  categoryChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#4b4c52',
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
    backgroundColor: '#eef1f5',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  usageBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#54657e',
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
  useButton: {
    height: 44,
    borderRadius: 16,
    backgroundColor: '#171f2d',
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
});
