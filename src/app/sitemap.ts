import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://alfred-writing.app';

  const publicPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.8, changeFrequency: 'monthly' as const },
    {
      path: '/mentions-legales',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
    },
    { path: '/cgu', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/cgv', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  return publicPages.map(({ path, priority, changeFrequency }) => ({
    url: `${appUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
