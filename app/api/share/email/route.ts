import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { getRequestIp, sanitizeEmail, sanitizeText, sanitizeUrl } from '@/lib/server/request';
import { toRem } from '@/lib/css-units';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const rem = (value: number) => toRem(value);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimitKey = `share-email:${user.id}:${getRequestIp(req)}`;
    const rateLimit = checkRateLimit(rateLimitKey, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } });
    }

    const body = await req.json();
    const email = sanitizeEmail(body?.email);
    const invoiceNumber = sanitizeText(body?.invoiceNumber, 80);
    const shareUrl = sanitizeUrl(body?.shareUrl);
    const senderName = sanitizeText(body?.senderName, 120) || 'SmartBill User';

    if (!email || !shareUrl) {
      return NextResponse.json({ error: 'Email and Share URL are required' }, { status: 400 });
    }

    const shareHost = new URL(shareUrl).host;
    const requestHost = req.headers.get('host');
    if (requestHost && shareHost !== requestHost) {
      return NextResponse.json({ error: 'Invalid share URL host' }, { status: 400 });
    }

    if (!resend) {
      console.log('------------------------------------------------');
      console.log(' [MOCK EMAIL SERVICE] ');
      console.log(` User: ${user.email}`);
      console.log(` To: ${email}`);
      console.log(` Subject: Invoice ${invoiceNumber} from ${senderName}`);
      console.log(` Link: ${shareUrl}`);
      console.log('------------------------------------------------');

      await new Promise(resolve => setTimeout(resolve, 300));
      return NextResponse.json({ success: true, message: 'Email queued (Mock Mode)', mock: true });
    }

    const data = await resend.emails.send({
      from: 'SmartBill <noreply@smartbillpro.com>',
      to: [email],
      subject: `Invoice ${invoiceNumber} from ${senderName}`,
      html: `
        <div style="font-family: sans-serif; max-width: ${rem(600)}; margin: 0 auto; padding: ${rem(20)};">
          <h2 style="color: #2563eb;">Invoice Shared</h2>
          <p>Hello,</p>
          <p><strong>${senderName}</strong> has shared an invoice with you.</p>
          <div style="background-color: #f8fafc; padding: ${rem(16)}; border-radius: ${rem(8)}; margin: ${rem(24)} 0;">
            <p style="margin: 0 0 ${rem(8)} 0; color: #64748b; font-size: ${rem(14)};">Invoice Number</p>
            <p style="margin: 0; font-weight: bold; font-size: ${rem(18)}; color: #0f172a;">${invoiceNumber}</p>
          </div>
          <a href="${shareUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: ${rem(12)} ${rem(24)}; text-decoration: none; border-radius: ${rem(6)}; font-weight: bold;">
            View Invoice
          </a>
          <p style="color: #64748b; font-size: ${rem(14)}; margin-top: ${rem(32)};">
            Powered by <a href="https://smartbillpro.com/" style="color: #64748b;">SmartBill</a>
          </p>
        </div>
      `
    });

    if (data.error) {
      console.error('Resend Error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
