'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase-browser';

declare global {
    interface Window {
        google: any;
    }
}

export function GoogleOneTap() {
    const { user } = useAuth();
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (user || !clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') return;

        function initGsi() {
            if (!window.google) return;
            window.google.accounts.id.initialize({
                client_id: clientId!,
                callback: async (response: any) => {
                    // Use Supabase signInWithIdToken — no manual JWT parsing needed
                    await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: response.credential,
                    });
                    // onAuthStateChange in AuthContext will automatically update the user state
                },
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: false,
            });
            // NOTE: prompt() intentionally NOT called here.
            // Login is triggered explicitly via LoginModal.
        }

        if (window.google) {
            initGsi();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGsi;
        document.head.appendChild(script);
    }, [user, clientId]);

    return null;
}
