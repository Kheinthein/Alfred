import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://alfred-writing.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/documents/', '/books/'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
