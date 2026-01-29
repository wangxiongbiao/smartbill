import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Free Professional Invoice Templates & Generator | SmartBill Pro",
    description: "Create and download professional invoices in seconds with our free templates. No registration required. Custom-tailored for freelancers, contractors, and small businesses.",
    keywords: ["invoice maker", "free invoice templates", "professional billing", "freelance invoice", "contractor billing"],
    openGraph: {
        title: "SmartBill Pro | Free Professional Invoice Maker",
        description: "Create professional invoices for free with SmartBill Pro. No registration required.",
        url: "https://smartbillpro.com",
        siteName: "SmartBill Pro",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "SmartBill Pro | Free Professional Invoice Maker",
        description: "Create professional invoices for free with SmartBill Pro. No registration required.",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "SmartBill Pro",
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1250"
        }
    };

    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={inter.className}>
                {children}
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="beforeInteractive" />
            </body>
        </html>
    );
}
