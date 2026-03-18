import type { TextInputProps } from 'react-native';

export type InputFilter =
  | 'text'
  | 'multilineText'
  | 'decimal'
  | 'integer'
  | 'phone'
  | 'email'
  | 'code'
  | 'search';

export function sanitizeInputValue(value: string, filter: InputFilter) {
  switch (filter) {
    case 'decimal':
      return sanitizeDecimal(value);
    case 'integer':
      return value.replace(/[^\d]/g, '');
    case 'phone':
      return value.replace(/[^\d+\-()\s]/g, '');
    case 'email':
      return value.replace(/[^a-zA-Z0-9@._+-]/g, '').replace(/\s+/g, '');
    case 'code':
      return value.replace(/[^A-Za-z0-9/_-]/g, '').toUpperCase();
    case 'search':
    case 'text':
      return value
        .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
        .replace(/[\r\n]+/g, ' ');
    case 'multilineText':
      return value.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
    default:
      return value;
  }
}

function sanitizeDecimal(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '');

  if (!cleaned) {
    return '';
  }

  const [integerPart, ...decimalParts] = cleaned.split('.');
  const nextInteger = integerPart.replace(/^0+(?=\d)/, '') || '0';

  if (decimalParts.length === 0) {
    return cleaned.startsWith('.') ? `0.${nextInteger}` : integerPart.replace(/^0+(?=\d)/, '');
  }

  return `${nextInteger}.${decimalParts.join('')}`;
}

export function getInputKeyboardProps(
  filter: InputFilter,
  multiline = false
): Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'autoComplete'
  | 'inputMode'
  | 'keyboardType'
  | 'returnKeyType'
  | 'spellCheck'
>
{
  switch (filter) {
    case 'decimal':
      return {
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'off',
        inputMode: 'decimal',
        keyboardType: 'decimal-pad',
        returnKeyType: 'done',
        spellCheck: false,
      };
    case 'integer':
      return {
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'off',
        inputMode: 'numeric',
        keyboardType: 'number-pad',
        returnKeyType: 'done',
        spellCheck: false,
      };
    case 'phone':
      return {
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'tel',
        inputMode: 'tel',
        keyboardType: 'phone-pad',
        returnKeyType: 'done',
        spellCheck: false,
      };
    case 'email':
      return {
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'email',
        inputMode: 'email',
        keyboardType: 'email-address',
        returnKeyType: 'done',
        spellCheck: false,
      };
    case 'code':
      return {
        autoCapitalize: 'characters',
        autoCorrect: false,
        autoComplete: 'off',
        inputMode: 'text',
        keyboardType: 'default',
        returnKeyType: 'done',
        spellCheck: false,
      };
    case 'search':
      return {
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'off',
        inputMode: 'search',
        keyboardType: 'web-search',
        returnKeyType: 'search',
        spellCheck: false,
      };
    case 'multilineText':
      return {
        autoCapitalize: 'sentences',
        autoCorrect: true,
        autoComplete: 'off',
        inputMode: 'text',
        keyboardType: multiline ? 'default' : 'default',
        returnKeyType: multiline ? 'default' : 'done',
        spellCheck: true,
      };
    case 'text':
    default:
      return {
        autoCapitalize: 'sentences',
        autoCorrect: false,
        autoComplete: 'off',
        inputMode: 'text',
        keyboardType: 'default',
        returnKeyType: 'done',
        spellCheck: false,
      };
  }
}
