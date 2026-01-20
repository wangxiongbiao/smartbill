import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key if available
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
    try {
        const { email, invoiceNumber, shareUrl, senderName } = await req.json();

        // Basic validation
        if (!email || !shareUrl) {
            return NextResponse.json(
                { error: 'Email and Share URL are required' },
                { status: 400 }
            );
        }

        // Mock mode if no API key is present
        if (!resend) {
            console.log('------------------------------------------------');
            console.log(' [MOCK EMAIL SERVICE] ');
            console.log(` To: ${email}`);
            console.log(` Subject: Invoice ${invoiceNumber} from ${senderName || 'SmartBill User'}`);
            console.log(` Link: ${shareUrl}`);
            console.log('------------------------------------------------');

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return NextResponse.json({
                success: true,
                message: 'Email queued (Mock Mode)',
                mock: true
            });
        }

        // Real Email Sending
        const data = await resend.emails.send({
            from: 'SmartBill <noreply@smartbillpro.com>', // Verified domain sender
            to: [email],
            subject: `Invoice ${invoiceNumber} from ${senderName || 'SmartBill User'}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Invoice Shared</h2>
                    <p>Hello,</p>
                    <p><strong>${senderName || 'A SmartBill user'}</strong> has shared an invoice with you.</p>
                    <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Invoice Number</p>
                        <p style="margin: 0; font-weight: bold; font-size: 18px; color: #0f172a;">${invoiceNumber}</p>
                    </div>
                    <a href="${shareUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        View Invoice
                    </a>
                    <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
                        Powered by <a href="https://smartbill.pro" style="color: #64748b;">SmartBill</a>
                    </p>
                </div>
            `,
        });

        if (data.error) {
            console.error('Resend Error:', data.error);
            return NextResponse.json({ error: data.error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Email API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
