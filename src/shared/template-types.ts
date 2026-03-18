import type { TemplateCategory } from '@/shared/types';

export const DEFAULT_TEMPLATE_CATEGORY: TemplateCategory = 'business';

export const TEMPLATE_TYPE_OPTIONS: Array<{ value: TemplateCategory; label: string }> = [
  { value: 'business', label: 'Business' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'service', label: 'Service' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'catering', label: 'Catering' },
  { value: 'consultation', label: 'Consultation' },
];

export function getTemplateTypeLabel(value?: TemplateCategory | null) {
  return (
    TEMPLATE_TYPE_OPTIONS.find((option) => option.value === value)?.label ||
    TEMPLATE_TYPE_OPTIONS[0].label
  );
}
