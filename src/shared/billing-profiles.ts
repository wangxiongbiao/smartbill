import type {
  BillingProfile,
  BillingProfileKind,
  Client,
  CustomField,
  Invoice,
  Sender,
} from '@/shared/types';

const MAX_CUSTOM_FIELDS = 20;

function trimText(value: string | undefined, maxLength = 1000) {
  return (value || '').trim().slice(0, maxLength);
}

function normalizeText(value: string | undefined) {
  return trimText(value).toLowerCase().replace(/\s+/g, ' ');
}

function normalizePhone(value: string | undefined) {
  return trimText(value, 40).replace(/[^\d+]/g, '');
}

export function sanitizeBillingCustomFields(fields: CustomField[] | undefined) {
  return (fields || [])
    .map((field, index) => ({
      id: trimText(field?.id, 80) || `field-${index + 1}`,
      label: trimText(field?.label, 120),
      value: trimText(field?.value),
    }))
    .filter((field) => field.label || field.value)
    .slice(0, MAX_CUSTOM_FIELDS);
}

export function sanitizeBillingProfileSnapshot(input: Partial<Sender | Client> | undefined) {
  return {
    name: trimText(input?.name, 160),
    email: trimText(input?.email, 320).toLowerCase(),
    phone: trimText(input?.phone, 40),
    address: trimText(input?.address),
    customFields: sanitizeBillingCustomFields(input?.customFields),
  };
}

function getBillingProfileSnapshot(kind: BillingProfileKind, invoice: Invoice) {
  const source = kind === 'sender' ? invoice.sender : invoice.client;

  return sanitizeBillingProfileSnapshot(source);
}

function hasBillingProfileContent(snapshot: ReturnType<typeof sanitizeBillingProfileSnapshot>) {
  if (snapshot.name.length < 2) {
    return false;
  }

  return Boolean(
    snapshot.email || snapshot.phone || snapshot.address || snapshot.customFields.length > 0
  );
}

export function buildBillingProfileSearchKey(
  snapshot: ReturnType<typeof sanitizeBillingProfileSnapshot>
) {
  const normalizedEmail = normalizeText(snapshot.email);

  if (normalizedEmail) {
    return `email:${normalizedEmail}`;
  }

  const normalizedPhone = normalizePhone(snapshot.phone);

  if (normalizedPhone) {
    return `phone:${normalizedPhone}`;
  }

  return `name:${normalizeText(snapshot.name)}`;
}

export function getBillingProfileLookupKey(
  kind: BillingProfileKind,
  source: Partial<Sender | Client | BillingProfile>
) {
  return `${kind}:${buildBillingProfileSearchKey(sanitizeBillingProfileSnapshot(source))}`;
}

export function matchesBillingProfile(profile: BillingProfile, query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const haystacks = [
    profile.name,
    profile.email,
    profile.phone,
    profile.address,
    ...(profile.customFields || []).flatMap((field) => [field.label, field.value]),
  ];

  return haystacks.some((value) => normalizeText(value).includes(normalizedQuery));
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

      if (!hasBillingProfileContent(snapshot)) {
        return;
      }

      const key = `${kind}:${buildBillingProfileSearchKey(snapshot)}`;

      if (profilesByKey.has(key)) {
        return;
      }

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
