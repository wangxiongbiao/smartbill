import { TemplateType } from '@/types/invoice';

export interface InvoiceTheme {
  id: TemplateType;
  pageBackground: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  surfaceColor: string;
  accentColor: string;
  headerPanelColor: string;
  titleColor: string;
  metaLabelColor: string;
  metaValueColor: string;
  sectionLabelColor: string;
  tableHeaderFill: string;
  tableHeaderText: string;
  totalBandFill?: string;
  totalBandText: string;
  continuationRuleColor: string;
  headerPanelVariant: 'plain' | 'soft' | 'dark';
  clientPanel: boolean;
}

export function getInvoiceTheme(template: TemplateType = 'minimalist'): InvoiceTheme {
  switch (template) {
    case 'modern':
      return {
        id: 'modern',
        pageBackground: '#fcfefe',
        textColor: '#1c2a2d',
        mutedColor: '#5c777f',
        borderColor: '#d6e4e6',
        surfaceColor: '#edf7f5',
        accentColor: '#2c7a78',
        headerPanelColor: '#edf7f5',
        titleColor: '#2c7a78',
        metaLabelColor: '#2c7a78',
        metaValueColor: '#1c2a2d',
        sectionLabelColor: '#2c7a78',
        tableHeaderFill: '#2c7a78',
        tableHeaderText: '#ffffff',
        totalBandFill: '#2c7a78',
        totalBandText: '#ffffff',
        continuationRuleColor: '#2c7a78',
        headerPanelVariant: 'soft',
        clientPanel: true,
      };
    case 'professional':
      return {
        id: 'professional',
        pageBackground: '#ffffff',
        textColor: '#172033',
        mutedColor: '#64748b',
        borderColor: '#d8dfed',
        surfaceColor: '#f4f7fc',
        accentColor: '#1e3a8a',
        headerPanelColor: '#1e3a8a',
        titleColor: '#ffffff',
        metaLabelColor: '#c9d7fb',
        metaValueColor: '#ffffff',
        sectionLabelColor: '#1e3a8a',
        tableHeaderFill: '#1e3a8a',
        tableHeaderText: '#ffffff',
        totalBandFill: '#1e3a8a',
        totalBandText: '#ffffff',
        continuationRuleColor: '#1e3a8a',
        headerPanelVariant: 'dark',
        clientPanel: true,
      };
    case 'minimalist':
    default:
      return {
        id: 'minimalist',
        pageBackground: '#ffffff',
        textColor: '#0f172a',
        mutedColor: '#64748b',
        borderColor: '#e2e8f0',
        surfaceColor: '#f8fafc',
        accentColor: '#0f172a',
        headerPanelColor: '#ffffff',
        titleColor: '#0f172a',
        metaLabelColor: '#64748b',
        metaValueColor: '#0f172a',
        sectionLabelColor: '#64748b',
        tableHeaderFill: '#f8fafc',
        tableHeaderText: '#64748b',
        totalBandText: '#0f172a',
        continuationRuleColor: '#e2e8f0',
        headerPanelVariant: 'plain',
        clientPanel: false,
      };
  }
}
