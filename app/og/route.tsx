import { ImageResponse } from 'next/og';
import { resolveLanguage } from '@/lib/marketing';
import { getFallbackTranslationLanguage } from '@/lib/language';
import { toRem } from '@/lib/css-units';

export const runtime = 'edge';
const rem = (value: number) => toRem(value);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'home';
  const lang = resolveLanguage(searchParams.get('lang'));

  const presets: Record<string, Record<'en' | 'zh-TW', {
    eyebrow: string;
    title: string;
    subtitle: string;
    tags: string[];
    readyLabel: string;
    sections: string[];
    invoicePdf: string;
  }>> = {
    home: {
      en: {
        eyebrow: 'SmartBill',
        title: 'Invoice generator, templates, and PDF export',
        subtitle: 'Built for freelancers, agencies, contractors, and small businesses.',
        tags: ['Templates', 'PDF export', 'Billing workflow'],
        readyLabel: 'Ready',
        sections: ['Client details', 'Payment info', 'Line items', 'PDF export'],
        invoicePdf: 'Invoice PDF',
      },
      'zh-TW': {
        eyebrow: 'SmartBill',
        title: '發票產生器、模板與 PDF 匯出',
        subtitle: '適合自由工作者、代理商、承包商與小型企業。',
        tags: ['模板', 'PDF 匯出', '開票流程'],
        readyLabel: '已就緒',
        sections: ['客戶資訊', '收款資訊', '明細項目', 'PDF 匯出'],
        invoicePdf: '發票 PDF',
      },
    },
    templates: {
      en: {
        eyebrow: 'SmartBill Templates',
        title: 'Reusable invoice templates for repeat billing',
        subtitle: 'Keep branding, speed up invoice creation, and stay consistent.',
        tags: ['Template reuse', 'Brand consistency', 'PDF export'],
        readyLabel: 'Ready',
        sections: ['Template setup', 'Billing blocks', 'Reusable items', 'PDF export'],
        invoicePdf: 'Invoice PDF',
      },
      'zh-TW': {
        eyebrow: 'SmartBill 模板',
        title: '適合重複開票的可重用發票模板',
        subtitle: '維持品牌一致、加快開票速度，並保持流程穩定。',
        tags: ['模板重用', '品牌一致', 'PDF 匯出'],
        readyLabel: '已就緒',
        sections: ['模板設定', '收款區塊', '可重用明細', 'PDF 匯出'],
        invoicePdf: '發票 PDF',
      },
    },
    'new-invoice': {
      en: {
        eyebrow: 'SmartBill Editor',
        title: 'Create a new invoice with live preview',
        subtitle: 'Add payment details, customize branding, and export polished PDFs.',
        tags: ['Live preview', 'Payment info', 'Branding'],
        readyLabel: 'Ready',
        sections: ['Client details', 'Payment info', 'Line items', 'PDF export'],
        invoicePdf: 'Invoice PDF',
      },
      'zh-TW': {
        eyebrow: 'SmartBill 編輯器',
        title: '在即時預覽中建立新發票',
        subtitle: '加入收款資訊、自訂品牌，並匯出專業 PDF。',
        tags: ['即時預覽', '收款資訊', '品牌設定'],
        readyLabel: '已就緒',
        sections: ['客戶資訊', '收款資訊', '明細項目', 'PDF 匯出'],
        invoicePdf: '發票 PDF',
      },
    },
  };

  const preset = (presets[view] || presets.home)[getFallbackTranslationLanguage(lang)];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 55%, #f8fafc 100%)',
          position: 'relative',
          fontFamily: 'Inter, sans-serif',
          color: '#0f172a',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at top left, rgba(15,23,42,0.10), transparent 28%)',
          }}
        />
        <div style={{ display: 'flex', width: '100%', padding: rem(64), justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '62%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: rem(14) }}>
              <div style={{ width: rem(54), height: rem(54), borderRadius: rem(18), background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: rem(24), fontWeight: 900 }}>
                S
              </div>
                  <div style={{ fontSize: rem(18), fontWeight: 800, letterSpacing: rem(2), textTransform: 'uppercase', color: '#475569' }}>{preset.eyebrow}</div>
            </div>
            <div style={{ marginTop: rem(28), fontSize: rem(58), lineHeight: 1.04, fontWeight: 900, letterSpacing: rem(-2.2) }}>{preset.title}</div>
            <div style={{ marginTop: rem(22), fontSize: rem(24), lineHeight: 1.5, color: '#475569' }}>{preset.subtitle}</div>
            <div style={{ display: 'flex', gap: rem(14), marginTop: rem(28) }}>
              {preset.tags.map((item) => (
                <div key={item} style={{ borderRadius: rem(999), background: '#e2e8f0', padding: `${rem(10)} ${rem(18)}`, fontSize: rem(18), fontWeight: 700, color: '#334155' }}>{item}</div>
              ))}
            </div>
          </div>

          <div style={{ width: '32%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', borderRadius: rem(32), background: '#0f172a', padding: rem(26), display: 'flex', flexDirection: 'column', boxShadow: `0 ${rem(30)} ${rem(80)} rgba(15,23,42,0.22)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `${rem(1)} solid rgba(255,255,255,0.08)`, paddingBottom: rem(18) }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: rem(14), fontWeight: 800, textTransform: 'uppercase', letterSpacing: rem(2), color: 'rgba(255,255,255,0.45)' }}>{preset.invoicePdf}</div>
                  <div style={{ marginTop: rem(8), fontSize: rem(28), fontWeight: 900, color: '#fff' }}>INV-2048</div>
                </div>
                <div style={{ borderRadius: rem(999), background: 'rgba(16,185,129,0.14)', color: '#bbf7d0', padding: `${rem(10)} ${rem(16)}`, fontSize: rem(16), fontWeight: 800 }}>{preset.readyLabel}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: rem(14), marginTop: rem(18) }}>
                {preset.sections.map((row, index) => (
                  <div key={row} style={{ display: 'flex', flexDirection: 'column', gap: rem(8), background: 'rgba(255,255,255,0.06)', borderRadius: rem(20), padding: `${rem(16)} ${rem(18)}` }}>
                    <div style={{ fontSize: rem(16), fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{row}</div>
                    <div style={{ height: rem(8), width: `${86 - index * 10}%`, borderRadius: rem(999), background: 'rgba(255,255,255,0.2)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
