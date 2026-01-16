
import { createClient } from '@/lib/supabase/server';
import { createInvoiceShare, CreateShareOptions } from '@/lib/supabase-share';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse body
        const body = await request.json();
        const { invoiceId, options } = body as { invoiceId: string, options: CreateShareOptions };

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
        }

        // 3. Create share
        const share = await createInvoiceShare(supabase, user.id, invoiceId, options);

        return NextResponse.json({ share });
    } catch (error) {
        console.error('API Error creating share:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
