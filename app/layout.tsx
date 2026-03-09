import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { LoginModal } from '@/components/LoginModal'
import { GoogleOneTap } from '@/components/GoogleOneTap'

export const metadata: Metadata = {
  title: 'Invoicefiy | Online Invoice Generator',
  description: 'Create professional invoices with live preview, reusable templates, one-click sharing, and direct payment details.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
          <LoginModal />
          <GoogleOneTap />
        </AuthProvider>
      </body>
    </html>
  )
}
