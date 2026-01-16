
import { createClient } from '@/lib/supabase/server';
import { revokeInvoiceShare } from '@/lib/supabase-share';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse query parameters
        const { searchParams } = new URL(request.url);
        const shareId = searchParams.get('id');

        if (!shareId) {
            return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
        }

        // 3. Revoke share
        await revokeInvoiceShare(supabase, user.id, shareId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error revoking share:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
