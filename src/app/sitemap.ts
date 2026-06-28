import { getAllTools } from '@/core/registry';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://localdevkit.app';
  const tools = getAllTools();

  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.category}/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...toolUrls,
  ];
}
