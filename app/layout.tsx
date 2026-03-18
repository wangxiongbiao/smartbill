import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartbillpro.com"),
  title: {
    default: "SmartBill | Invoice Generator, Templates & PDF Export",
    template: "%s | SmartBill",
  },
  description:
    "SmartBill helps freelancers and small businesses create professional invoices, reuse templates, manage invoice records, and export clean PDFs in minutes.",
  keywords: [
    "invoice generator",
    "invoice maker",
    "invoice templates",
    "pdf invoice",
    "freelancer invoice",
    "small business invoicing",
    "billing software",
    "smartbill",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SmartBill | Invoice Generator, Templates & PDF Export",
    description:
      "Create branded invoices, reuse templates, track records, and export polished PDFs with SmartBill.",
    url: "https://smartbillpro.com",
    siteName: "SmartBill",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartBill | Invoice Generator, Templates & PDF Export",
    description:
      "Create professional invoices and PDF exports with SmartBill.",
  },
  category: "business software",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SmartBill',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Invoice generator for freelancers and small businesses with templates, record management, and PDF export.',
      url: 'https://smartbillpro.com',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Invoice editor',
        'Invoice templates',
        'PDF export',
        'Client billing records',
        'Payment information blocks',
        'Logo and branding customization',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SmartBill',
      url: 'https://smartbillpro.com',
      email: 'smartbillpro@gmail.com',
    },
  ];

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
      </body>
    </html>
  );
}
