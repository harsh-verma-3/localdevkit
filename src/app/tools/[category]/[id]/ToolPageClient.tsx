'use client';

import { Suspense } from 'react';
import { getToolById } from '@/core/registry';
import { ToolLayout } from '@/components/layout/ToolLayout';

interface ToolPageClientProps {
  toolId: string;
}

function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-6 h-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none" aria-label="Loading tool">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm text-foreground-muted">Loading tool…</p>
      </div>
    </div>
  );
}

export function ToolPageClient({ toolId }: ToolPageClientProps) {
  const tool = getToolById(toolId);
  if (!tool) return null;

  const ToolComponent = tool.component;

  return (
    <ToolLayout tool={tool}>
      <Suspense fallback={<ToolLoadingFallback />}>
        <ToolComponent />
      </Suspense>
    </ToolLayout>
  );
}
