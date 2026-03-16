import type {
  SchoolPoster,
  SchoolPosterDocument,
  SchoolPosterDocumentFrame,
  SchoolPosterLayoutId,
  SchoolPosterOfferRow,
  SchoolPosterShell,
  SchoolPosterShellVisibility,
} from '@/types';

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `school-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getVisibilityPreset(layoutId: SchoolPosterLayoutId): SchoolPosterShellVisibility {
  if (layoutId === 'letter-poster') {
    return {
      brand: false,
      school: false,
      student: false,
      footer: false,
      qr: true,
    };
  }

  return {
    brand: true,
    school: true,
    student: true,
    footer: true,
    qr: true,
  };
}

function createDefaultDocumentFrame(): SchoolPosterDocumentFrame {
  return {
    variant: 'placeholder',
  };
}

function createDefaultShell(
  layoutId: SchoolPosterLayoutId,
  options?: { withPresetCopy?: boolean }
): SchoolPosterShell {
  const withPresetCopy = options?.withPresetCopy ?? false;

  return {
    brand: {
      title: withPresetCopy ? '环球视野教育' : '',
      subtitle: withPresetCopy ? 'GLOBAL\nHORIZONS\nEDU' : '',
    },
    school: {
      nameCn: withPresetCopy ? '新加坡管理学院' : '',
      nameEn: withPresetCopy ? 'SINGAPORE INSTITUTE OF MANAGEMENT' : '',
    },
    student: {
      name: withPresetCopy ? '张同学' : '',
      age: withPresetCopy ? '17岁' : '',
      city: withPresetCopy ? '广州' : '',
      applicationPeriod: withPresetCopy ? '2026 秋季入学' : '',
      transferPath: withPresetCopy ? '国际课程衔接路径' : '',
    },
    footer: {
      tuition: withPresetCopy ? '学费预算：约 S$18,000 / 年' : '',
      pathway: withPresetCopy ? '升学路径：预科 -> 本科' : '',
      highlights: withPresetCopy ? '支持材料规划与申请节点管理' : '',
    },
    documentFrame: createDefaultDocumentFrame(),
    visibility: getVisibilityPreset(layoutId),
  };
}

function createDefaultDocument(layoutId: SchoolPosterLayoutId): SchoolPosterDocument {
  if (layoutId === 'letter-poster') {
    return {
      mode: 'image',
      date: '',
      reference: '',
      recipient: '',
      title: '',
      greeting: '',
      introduction: '',
      confirmation: '',
      paymentNote: '',
      totalLabel: '',
      rows: [],
    };
  }

  return {
    mode: 'offer-table',
    date: '',
    reference: '',
    recipient: '',
    title: '',
    greeting: '',
    introduction: '',
    confirmation: '',
    paymentNote: '',
    totalLabel: '',
    rows: [],
  };
}

export function getSchoolPosterStorageKey(userId?: string | null) {
  return `school_poster_records_v1:${userId || 'local'}`;
}

export function createSchoolPoster(layoutId: SchoolPosterLayoutId = 'offer-poster'): SchoolPoster {
  const now = new Date().toISOString();

  return {
    id: createId(),
    createdAt: now,
    updatedAt: now,
    layoutId,
    shell: createDefaultShell(layoutId, { withPresetCopy: true }),
    document: createDefaultDocument(layoutId),
  };
}

export function createDefaultSchoolPoster(): SchoolPoster {
  return createSchoolPoster('offer-poster');
}

function normalizeRows(rows: unknown, fallbackRows: SchoolPosterOfferRow[]) {
  if (!Array.isArray(rows)) return fallbackRows;
  if (rows.length === 0) return [];

  return rows.map((row) => ({
    id: typeof row?.id === 'string' ? row.id : createId(),
    item: typeof row?.item === 'string' ? row.item : '',
    amount: typeof row?.amount === 'string' ? row.amount : '',
    dueDate: typeof row?.dueDate === 'string' ? row.dueDate : '',
  }));
}

function normalizeDocumentFrame(frame: any): SchoolPosterDocumentFrame {
  return {
    variant: frame?.variant === 'placeholder' ? 'placeholder' : 'placeholder',
  };
}

export function normalizeSchoolPoster(record: any): SchoolPoster {
  const layoutId: SchoolPosterLayoutId = record?.layoutId === 'letter-poster' ? 'letter-poster' : 'offer-poster';
  const shellDefaults = createDefaultShell(layoutId);
  const documentDefaults = createDefaultDocument(layoutId);

  if (record?.shell && record?.document) {
    return {
      id: typeof record.id === 'string' ? record.id : createId(),
      createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
      updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
      layoutId,
      shell: {
        brand: {
          logo: typeof record.shell.brand?.logo === 'string' ? record.shell.brand.logo : shellDefaults.brand.logo,
          title: typeof record.shell.brand?.title === 'string' ? record.shell.brand.title : shellDefaults.brand.title,
          subtitle: typeof record.shell.brand?.subtitle === 'string' ? record.shell.brand.subtitle : shellDefaults.brand.subtitle,
        },
        school: {
          nameCn: typeof record.shell.school?.nameCn === 'string' ? record.shell.school.nameCn : shellDefaults.school.nameCn,
          nameEn: typeof record.shell.school?.nameEn === 'string' ? record.shell.school.nameEn : shellDefaults.school.nameEn,
        },
        student: {
          name: typeof record.shell.student?.name === 'string' ? record.shell.student.name : shellDefaults.student.name,
          age: typeof record.shell.student?.age === 'string' ? record.shell.student.age : shellDefaults.student.age,
          city: typeof record.shell.student?.city === 'string' ? record.shell.student.city : shellDefaults.student.city,
          applicationPeriod: typeof record.shell.student?.applicationPeriod === 'string' ? record.shell.student.applicationPeriod : shellDefaults.student.applicationPeriod,
          transferPath: typeof record.shell.student?.transferPath === 'string' ? record.shell.student.transferPath : shellDefaults.student.transferPath,
        },
        heroImage: typeof record.shell.heroImage === 'string' ? record.shell.heroImage : undefined,
        qrCode: typeof record.shell.qrCode === 'string' ? record.shell.qrCode : undefined,
        footer: {
          tuition: typeof record.shell.footer?.tuition === 'string' ? record.shell.footer.tuition : shellDefaults.footer.tuition,
          pathway: typeof record.shell.footer?.pathway === 'string' ? record.shell.footer.pathway : shellDefaults.footer.pathway,
          highlights: typeof record.shell.footer?.highlights === 'string' ? record.shell.footer.highlights : shellDefaults.footer.highlights,
        },
        documentFrame: normalizeDocumentFrame(record.shell.documentFrame),
        visibility: {
          brand: typeof record.shell.visibility?.brand === 'boolean' ? record.shell.visibility.brand : shellDefaults.visibility.brand,
          school: typeof record.shell.visibility?.school === 'boolean' ? record.shell.visibility.school : shellDefaults.visibility.school,
          student: typeof record.shell.visibility?.student === 'boolean' ? record.shell.visibility.student : shellDefaults.visibility.student,
          footer: typeof record.shell.visibility?.footer === 'boolean' ? record.shell.visibility.footer : shellDefaults.visibility.footer,
          qr: typeof record.shell.visibility?.qr === 'boolean' ? record.shell.visibility.qr : shellDefaults.visibility.qr,
        },
      },
      document: {
        mode: record.document.mode === 'image' ? 'image' : 'offer-table',
        logo: typeof record.document.logo === 'string' ? record.document.logo : undefined,
        image: typeof record.document.image === 'string' ? record.document.image : undefined,
        date: typeof record.document.date === 'string' ? record.document.date : documentDefaults.date,
        reference: typeof record.document.reference === 'string' ? record.document.reference : documentDefaults.reference,
        recipient: typeof record.document.recipient === 'string' ? record.document.recipient : documentDefaults.recipient,
        title: typeof record.document.title === 'string' ? record.document.title : documentDefaults.title,
        greeting: typeof record.document.greeting === 'string' ? record.document.greeting : documentDefaults.greeting,
        introduction: typeof record.document.introduction === 'string' ? record.document.introduction : documentDefaults.introduction,
        confirmation: typeof record.document.confirmation === 'string' ? record.document.confirmation : documentDefaults.confirmation,
        paymentNote: typeof record.document.paymentNote === 'string' ? record.document.paymentNote : documentDefaults.paymentNote,
        totalLabel: typeof record.document.totalLabel === 'string' ? record.document.totalLabel : documentDefaults.totalLabel,
        rows: normalizeRows(record.document.rows, documentDefaults.rows),
      },
    };
  }

  const legacy = record || {};

  return {
    id: typeof legacy.id === 'string' ? legacy.id : createId(),
    createdAt: typeof legacy.createdAt === 'string' ? legacy.createdAt : new Date().toISOString(),
    updatedAt: typeof legacy.updatedAt === 'string' ? legacy.updatedAt : new Date().toISOString(),
    layoutId,
    shell: {
      brand: {
        logo: typeof legacy.brand?.logo === 'string' ? legacy.brand.logo : undefined,
        title: typeof legacy.brand?.title === 'string' ? legacy.brand.title : shellDefaults.brand.title,
        subtitle: typeof legacy.brand?.subtitle === 'string' ? legacy.brand.subtitle : shellDefaults.brand.subtitle,
      },
      school: {
        nameCn: typeof legacy.school?.nameCn === 'string' ? legacy.school.nameCn : shellDefaults.school.nameCn,
        nameEn: typeof legacy.school?.nameEn === 'string' ? legacy.school.nameEn : shellDefaults.school.nameEn,
      },
      student: {
        name: typeof legacy.student?.name === 'string' ? legacy.student.name : shellDefaults.student.name,
        age: typeof legacy.student?.age === 'string' ? legacy.student.age : shellDefaults.student.age,
        city: typeof legacy.student?.city === 'string' ? legacy.student.city : shellDefaults.student.city,
        applicationPeriod: typeof legacy.student?.applicationPeriod === 'string' ? legacy.student.applicationPeriod : shellDefaults.student.applicationPeriod,
        transferPath: typeof legacy.student?.transferPath === 'string' ? legacy.student.transferPath : shellDefaults.student.transferPath,
      },
      heroImage: typeof legacy.bottom?.heroImage === 'string' ? legacy.bottom.heroImage : undefined,
      qrCode: typeof legacy.bottom?.qrCode === 'string' ? legacy.bottom.qrCode : undefined,
      footer: {
        tuition: typeof legacy.bottom?.tuition === 'string' ? legacy.bottom.tuition : shellDefaults.footer.tuition,
        pathway: typeof legacy.bottom?.pathway === 'string' ? legacy.bottom.pathway : shellDefaults.footer.pathway,
        highlights: typeof legacy.bottom?.highlights === 'string' ? legacy.bottom.highlights : shellDefaults.footer.highlights,
      },
      documentFrame: normalizeDocumentFrame(legacy.documentFrame),
      visibility: shellDefaults.visibility,
    },
    document: {
      mode: 'offer-table',
      logo: typeof legacy.offer?.crest === 'string' ? legacy.offer.crest : undefined,
      image: undefined,
      date: typeof legacy.offer?.date === 'string' ? legacy.offer.date : documentDefaults.date,
      reference: '',
      recipient: typeof legacy.offer?.recipient === 'string' ? legacy.offer.recipient : documentDefaults.recipient,
      title: typeof legacy.offer?.title === 'string' ? legacy.offer.title : documentDefaults.title,
      greeting: typeof legacy.offer?.greeting === 'string' ? legacy.offer.greeting : documentDefaults.greeting,
      introduction: typeof legacy.offer?.introduction === 'string' ? legacy.offer.introduction : documentDefaults.introduction,
      confirmation: typeof legacy.offer?.confirmation === 'string' ? legacy.offer.confirmation : documentDefaults.confirmation,
      paymentNote: typeof legacy.offer?.paymentNote === 'string' ? legacy.offer.paymentNote : documentDefaults.paymentNote,
      totalLabel: typeof legacy.offer?.totalLabel === 'string' ? legacy.offer.totalLabel : documentDefaults.totalLabel,
      rows: normalizeRows(legacy.offer?.rows, documentDefaults.rows),
    },
  };
}

export function cloneSchoolPoster(record: SchoolPoster): SchoolPoster {
  const now = new Date().toISOString();
  const cloned = JSON.parse(JSON.stringify(record)) as SchoolPoster;

  return {
    ...normalizeSchoolPoster(cloned),
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
}

export function clearSchoolPosterContent(record: SchoolPoster): SchoolPoster {
  return normalizeSchoolPoster({
    ...record,
    shell: {
      ...record.shell,
      brand: {
        ...record.shell.brand,
        logo: undefined,
        title: '',
        subtitle: '',
      },
      school: {
        ...record.shell.school,
        nameCn: '',
        nameEn: '',
      },
      student: {
        ...record.shell.student,
        name: '',
        age: '',
        city: '',
        applicationPeriod: '',
        transferPath: '',
      },
      heroImage: undefined,
      qrCode: undefined,
      footer: {
        ...record.shell.footer,
        tuition: '',
        pathway: '',
        highlights: '',
      },
      visibility: {
        ...record.shell.visibility,
        brand: false,
        school: false,
        student: false,
        footer: false,
        qr: false,
      },
    },
    document: {
      ...record.document,
      logo: undefined,
      image: undefined,
      date: '',
      reference: '',
      recipient: '',
      title: '',
      greeting: '',
      introduction: '',
      confirmation: '',
      paymentNote: '',
      totalLabel: '',
      rows: [],
    },
  });
}

export function applyLayoutPreset(record: SchoolPoster, layoutId: SchoolPosterLayoutId): SchoolPoster {
  const visibility = getVisibilityPreset(layoutId);

  return normalizeSchoolPoster({
    ...record,
    layoutId,
    shell: {
      ...record.shell,
      visibility,
    },
  });
}

export function applyDocumentModePreset(record: SchoolPoster, mode: SchoolPosterDocument['mode']): SchoolPoster {
  return normalizeSchoolPoster({
    ...record,
    document: {
      ...record.document,
      mode,
    },
  });
}

export function readSchoolPosters(storageKey: string): SchoolPoster[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeSchoolPoster);
  } catch {
    return [];
  }
}

export function writeSchoolPosters(storageKey: string, records: SchoolPoster[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  } catch (error) {
    console.error('[writeSchoolPosters] Failed to persist school posters.', error);
  }
}
