
import { Metadata } from 'next';
import '../../globals.css'; // Import global styles

export const metadata: Metadata = {
    title: 'SmartBill Invoice Share',
    description: 'View professional invoice shared via SmartBill',
};

export default function ShareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
            </head>
            <body className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
                {children}
            </body>
        </html>
    );
}
