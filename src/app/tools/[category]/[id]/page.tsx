import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllTools, getToolById } from '@/core/registry';
import { ToolPageClient } from './ToolPageClient';

interface ToolPageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

// Generate static paths for all tools at build time
export async function generateStaticParams() {
  return getAllTools().map((tool) => ({
    category: tool.category,
    id: tool.id,
  }));
}

// Generate per-tool SEO metadata
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const tool = getToolById(id);
  if (!tool) return {};

  const title = `${tool.name} — Free Online ${tool.name}`;
  const description = `${tool.description} Free, private, and runs entirely in your browser. No data is sent to any server.`;

  return {
    title,
    description,
    keywords: tool.keywords,
    openGraph: {
      title,
      description,
      url: `https://localdevkit.app/tools/${tool.category}/${tool.id}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://localdevkit.app/tools/${tool.category}/${tool.id}`,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id, category } = await params;
  const tool = getToolById(id);

  // Validate that category also matches to prevent URL spoofing
  if (!tool || tool.category !== category) {
    notFound();
  }

  return <ToolPageClient toolId={tool.id} />;
}
