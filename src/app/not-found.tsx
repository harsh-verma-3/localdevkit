import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-primary" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v3M11 14h.01"/>
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-lg text-foreground-muted font-medium">Page not found</p>
        <p className="text-sm text-foreground-subtle max-w-sm">
          The tool or page you&apos;re looking for doesn&apos;t exist. It may have been moved or the URL is incorrect.
        </p>
      </div>
      <Link href="/"
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm
                   hover:bg-primary/90 transition-colors">
        Back to all tools
      </Link>
    </div>
  );
}
