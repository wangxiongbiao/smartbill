import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://smartbillpro.com';
  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'en-US': `${baseUrl}/`,
          'zh-TW': `${baseUrl}/?lang=zh-TW`,
        },
      },
    },
    {
      url: `${baseUrl}/invoice-templates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'en-US': `${baseUrl}/invoice-templates`,
          'zh-TW': `${baseUrl}/invoice-templates?lang=zh-TW`,
        },
      },
    },
  ];
}
