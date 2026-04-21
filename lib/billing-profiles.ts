import type {
  BillingProfile,
  BillingProfileKind,
  Client,
  CustomField,
  Invoice,
  Sender,
} from '@/types';

const MAX_NAME_LENGTH = 160;
const MAX_EMAIL_LENGTH = 320;
const MAX_PHONE_LENGTH = 40;
const MAX_ADDRESS_LENGTH = 1000;
const MAX_CUSTOM_FIELDS = 20;
const MAX_CUSTOM_FIELD_LABEL_LENGTH = 120;
const MAX_CUSTOM_FIELD_VALUE_LENGTH = 1000;

export interface BillingProfileSnapshot {
  name: string;
  email: string;
  phone: string;
  address: string;
  customFields: CustomField[];
}

function trimText(value: string | undefined, maxLength: number) {
  return (value || '').trim().slice(0, maxLength);
}

function normalizeText(value: string | undefined) {
  return trimText(value, 1000).toLowerCase().replace(/\s+/g, ' ');
}

function normalizePhone(value: string | undefined) {
  return trimText(value, MAX_PHONE_LENGTH).replace(/[^\d+]/g, '');
}

export function sanitizeBillingCustomFields(fields: CustomField[] | undefined) {
  return (fields || [])
    .map((field, index) => ({
      id: trimText(field?.id, 80) || `field-${index + 1}`,
      label: trimText(field?.label, MAX_CUSTOM_FIELD_LABEL_LENGTH),
      value: trimText(field?.value, MAX_CUSTOM_FIELD_VALUE_LENGTH),
    }))
    .filter((field) => field.label || field.value)
    .slice(0, MAX_CUSTOM_FIELDS);
}

export function sanitizeBillingProfileSnapshot(input: Partial<Sender | Client> | undefined): BillingProfileSnapshot {
  return {
    name: trimText(input?.name, MAX_NAME_LENGTH),
    email: trimText(input?.email, MAX_EMAIL_LENGTH).toLowerCase(),
    phone: trimText(input?.phone, MAX_PHONE_LENGTH),
    address: trimText(input?.address, MAX_ADDRESS_LENGTH),
    customFields: sanitizeBillingCustomFields(input?.customFields),
  };
}

export function getBillingProfileSnapshot(kind: BillingProfileKind, invoice: Invoice): BillingProfileSnapshot {
  const source = kind === 'sender' ? invoice.sender : invoice.client;
  return sanitizeBillingProfileSnapshot(source);
}

export function hasBillingProfileContent(snapshot: BillingProfileSnapshot) {
  if (snapshot.name.length < 2) return false;

  return Boolean(
    snapshot.email
      || snapshot.phone
      || snapshot.address
      || snapshot.customFields.length > 0
  );
}

export function buildBillingProfileSearchKey(snapshot: BillingProfileSnapshot) {
  const normalizedEmail = normalizeText(snapshot.email);
  if (normalizedEmail) return `email:${normalizedEmail}`;

  const normalizedPhone = normalizePhone(snapshot.phone);
  if (normalizedPhone) return `phone:${normalizedPhone}`;

  return `name:${normalizeText(snapshot.name)}`;
}

export function getBillingProfileLookupKey(kind: BillingProfileKind, source: Partial<Sender | Client | BillingProfile>) {
  return `${kind}:${buildBillingProfileSearchKey(sanitizeBillingProfileSnapshot(source))}`;
}

export function matchesBillingProfile(profile: BillingProfile, query: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const haystacks = [
    profile.name,
    profile.email,
    profile.phone,
    profile.address,
    ...(profile.customFields || []).flatMap((field) => [field.label, field.value]),
  ];

  return haystacks.some((value) => normalizeText(value).includes(normalizedQuery));
}

export function applyBillingProfileToSender(currentSender: Sender, profile: BillingProfile): Sender {
  return {
    ...currentSender,
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    address: profile.address,
    customFields: sanitizeBillingCustomFields(profile.customFields),
  };
}

export function applyBillingProfileToClient(currentClient: Client, profile: BillingProfile): Client {
  return {
    ...currentClient,
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    address: profile.address,
    customFields: sanitizeBillingCustomFields(profile.customFields),
  };
}

export function getSenderDefaultsFromBillingProfile(profile?: BillingProfile | null): Pick<Sender, 'name' | 'email' | 'phone' | 'address'> {
  return {
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  };
}

export function deriveBillingProfilesFromInvoices(records: Invoice[]) {
  const sortedRecords = [...records].sort((a, b) => {
    const aTime = Date.parse(a.date || '') || 0;
    const bTime = Date.parse(b.date || '') || 0;
    return bTime - aTime;
  });

  const profilesByKey = new Map<string, BillingProfile>();

  sortedRecords.forEach((record) => {
    (['sender', 'client'] as BillingProfileKind[]).forEach((kind) => {
      const snapshot = getBillingProfileSnapshot(kind, record);
      if (!hasBillingProfileContent(snapshot)) return;

      const key = `${kind}:${buildBillingProfileSearchKey(snapshot)}`;
      if (profilesByKey.has(key)) return;

      profilesByKey.set(key, {
        id: `record-${kind}-${record.id}`,
        userId: '',
        kind,
        name: snapshot.name,
        email: snapshot.email,
        phone: snapshot.phone,
        address: snapshot.address,
        customFields: snapshot.customFields,
        isDefault: false,
        lastUsedAt: record.date,
        createdAt: record.date || new Date(0).toISOString(),
        updatedAt: record.date || new Date(0).toISOString(),
      });
    });
  });

  return [...profilesByKey.values()];
}

export function mapBillingProfileRow(row: Record<string, unknown>): BillingProfile {
  return {
    id: String(row.id || ''),
    userId: String(row.user_id || ''),
    kind: (row.kind === 'sender' ? 'sender' : 'client') as BillingProfileKind,
    name: trimText(typeof row.name === 'string' ? row.name : '', MAX_NAME_LENGTH),
    email: trimText(typeof row.email === 'string' ? row.email : '', MAX_EMAIL_LENGTH).toLowerCase(),
    phone: trimText(typeof row.phone === 'string' ? row.phone : '', MAX_PHONE_LENGTH),
    address: trimText(typeof row.address === 'string' ? row.address : '', MAX_ADDRESS_LENGTH),
    customFields: sanitizeBillingCustomFields(Array.isArray(row.custom_fields) ? row.custom_fields as CustomField[] : []),
    isDefault: Boolean(row.is_default),
    lastUsedAt: typeof row.last_used_at === 'string' ? row.last_used_at : undefined,
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
  };
}
