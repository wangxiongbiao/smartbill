'use client'

import { useEffect } from 'react'

// This page runs inside the OAuth popup window.
// It notifies the main window via BroadcastChannel, then closes itself.
export default function CallbackSuccess() {
    useEffect(() => {
        try {
            const channel = new BroadcastChannel('supabase_auth')
            channel.postMessage({ type: 'LOGIN_SUCCESS' })
            channel.close()
        } catch {
            // BroadcastChannel not supported (rare), just close
        }
        window.close()
    }, [])

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'system-ui, sans-serif',
                color: '#64748b',
            }}
        >
            <p>登录成功，正在关闭...</p>
        </div>
    )
}
