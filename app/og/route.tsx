import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'home';

  const presets: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
    home: {
      eyebrow: 'SmartBill',
      title: 'Invoice generator, templates, and PDF export',
      subtitle: 'Built for freelancers, agencies, contractors, and small businesses.',
    },
    templates: {
      eyebrow: 'SmartBill Templates',
      title: 'Reusable invoice templates for repeat billing',
      subtitle: 'Keep branding, speed up invoice creation, and stay consistent.',
    },
    'new-invoice': {
      eyebrow: 'SmartBill Editor',
      title: 'Create a new invoice with live preview',
      subtitle: 'Add payment details, customize branding, and export polished PDFs.',
    },
  };

  const preset = presets[view] || presets.home;

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
        <div style={{ display: 'flex', width: '100%', padding: '64px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '62%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: 18, background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900 }}>
                S
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#475569' }}>{preset.eyebrow}</div>
            </div>
            <div style={{ marginTop: 28, fontSize: 58, lineHeight: 1.04, fontWeight: 900, letterSpacing: -2.2 }}>{preset.title}</div>
            <div style={{ marginTop: 22, fontSize: 24, lineHeight: 1.5, color: '#475569' }}>{preset.subtitle}</div>
            <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
              {['Templates', 'PDF export', 'Billing workflow'].map((item) => (
                <div key={item} style={{ borderRadius: 999, background: '#e2e8f0', padding: '10px 18px', fontSize: 18, fontWeight: 700, color: '#334155' }}>{item}</div>
              ))}
            </div>
          </div>

          <div style={{ width: '32%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', borderRadius: 32, background: '#0f172a', padding: 26, display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(15,23,42,0.22)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.45)' }}>Invoice PDF</div>
                  <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: '#fff' }}>INV-2048</div>
                </div>
                <div style={{ borderRadius: 999, background: 'rgba(16,185,129,0.14)', color: '#bbf7d0', padding: '10px 16px', fontSize: 16, fontWeight: 800 }}>Ready</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                {['Client details', 'Payment info', 'Line items', 'PDF export'].map((row, index) => (
                  <div key={row} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '16px 18px' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{row}</div>
                    <div style={{ height: 8, width: `${86 - index * 10}%`, borderRadius: 999, background: 'rgba(255,255,255,0.2)' }} />
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
