'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                        use_fedcm_for_prompt?: boolean;
                    }) => void;
                    prompt: (notification?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

function parseJwt(token: string): Record<string, string> {
    try {
        const base64 = token.split('.')[1];
        const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch {
        return {};
    }
}

export function GoogleOneTap() {
    const { user, login } = useAuth();
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Only pre-initialize the GSI library so it's ready for LoginModal's useGoogleLogin().
    // We intentionally do NOT call prompt() here to avoid FedCM conflicts with LoginModal.
    // Chrome 131+ forces FedCM and only allows one concurrent request.
    useEffect(() => {
        if (user || !clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') return;

        function initGsi() {
            if (!window.google) return;
            window.google.accounts.id.initialize({
                client_id: clientId!,
                callback: (response) => {
                    const payload = parseJwt(response.credential);
                    if (payload.sub) {
                        login({
                            sub: payload.sub,
                            name: payload.name || '',
                            email: payload.email || '',
                            picture: payload.picture || '',
                        });
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: false,
            });
            // NOTE: prompt() intentionally NOT called here.
            // Login is triggered explicitly via LoginModal → useGoogleLogin().
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
    }, [user, clientId, login]);

    return null;
}
