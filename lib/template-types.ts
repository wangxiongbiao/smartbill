import type { TemplateCategory } from '@/types';

export const DEFAULT_TEMPLATE_TYPE: TemplateCategory = 'business';

export const TEMPLATE_TYPE_OPTIONS: Array<{ value: TemplateCategory; label: string }> = [
  { value: 'business', label: 'Business' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'service', label: 'Service' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'catering', label: 'Catering' },
  { value: 'consultation', label: 'Consultation' },
];

const TEMPLATE_TYPE_VALUES = new Set<TemplateCategory>(
  TEMPLATE_TYPE_OPTIONS.map((option) => option.value)
);

export function isTemplateType(value: string): value is TemplateCategory {
  return TEMPLATE_TYPE_VALUES.has(value as TemplateCategory);
}

export function normalizeTemplateType(value?: string | null): TemplateCategory | null {
  if (!value) return null;
  return isTemplateType(value) ? value : null;
}

export function resolveTemplateType(value?: string | null): TemplateCategory {
  return normalizeTemplateType(value) || DEFAULT_TEMPLATE_TYPE;
}

export function getTemplateTypeLabel(value?: string | null) {
  const resolved = resolveTemplateType(value);
  return TEMPLATE_TYPE_OPTIONS.find((option) => option.value === resolved)?.label || 'Business';
}
