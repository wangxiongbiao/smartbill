import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/invoice-templates'],
        disallow: ['/dashboard', '/invoices/', '/templates', '/settings', '/share/', '/api/'],
      },
    ],
    sitemap: 'https://smartbillpro.com/sitemap.xml',
  };
}
