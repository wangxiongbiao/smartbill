import { MetadataRoute } from 'next';
import { buildLangHref } from '@/lib/marketing';
import { getLocaleForLanguage, SUPPORTED_LANGUAGES } from '@/lib/language';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://smartbillpro.com';
  const now = new Date();
  const buildAlternates = (path: string) => ({
    languages: Object.fromEntries(
      SUPPORTED_LANGUAGES.map((lang) => [getLocaleForLanguage(lang), `${baseUrl}${buildLangHref(path, lang)}`]),
    ),
  });

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: buildAlternates('/'),
    },
    {
      url: `${baseUrl}/invoice-templates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: buildAlternates('/invoice-templates'),
    },
  ];
}
