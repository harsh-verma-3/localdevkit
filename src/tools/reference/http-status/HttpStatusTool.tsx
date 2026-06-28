'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const HTTP_CODES = [
  // 1xx
  { code: 100, name: 'Continue', category: '1xx', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, name: 'Switching Protocols', category: '1xx', description: 'The server agrees to switch protocols as requested by the client (e.g., HTTP to WebSocket).' },
  { code: 102, name: 'Processing', category: '1xx', description: 'WebDAV: The server has received and is processing the request, but no response is available yet.' },
  // 2xx
  { code: 200, name: 'OK', category: '2xx', description: 'The request succeeded. The response body contains the requested data.' },
  { code: 201, name: 'Created', category: '2xx', description: 'The request succeeded and a new resource was created. Used after POST or PUT.' },
  { code: 202, name: 'Accepted', category: '2xx', description: 'The request has been accepted for processing, but the processing has not been completed.' },
  { code: 204, name: 'No Content', category: '2xx', description: 'The request succeeded but there is no content to return. Common after DELETE.' },
  { code: 206, name: 'Partial Content', category: '2xx', description: 'The server is delivering only part of the resource (range request). Used for resumable downloads.' },
  // 3xx
  { code: 301, name: 'Moved Permanently', category: '3xx', description: 'The URL has been permanently moved to a new location. Browsers and crawlers should update their bookmarks.' },
  { code: 302, name: 'Found', category: '3xx', description: 'Temporary redirect. The resource is temporarily available at a different URL.' },
  { code: 304, name: 'Not Modified', category: '3xx', description: 'The cached version of the resource is still valid. Used with ETag and Last-Modified headers.' },
  { code: 307, name: 'Temporary Redirect', category: '3xx', description: 'Like 302 but the HTTP method must not change during the redirect.' },
  { code: 308, name: 'Permanent Redirect', category: '3xx', description: 'Like 301 but the HTTP method must not change during the redirect.' },
  // 4xx
  { code: 400, name: 'Bad Request', category: '4xx', description: 'The server cannot process the request due to a client error (malformed syntax, invalid parameters).' },
  { code: 401, name: 'Unauthorized', category: '4xx', description: 'Authentication is required. The client must authenticate itself to get the requested response.' },
  { code: 403, name: 'Forbidden', category: '4xx', description: 'The client does not have permission to access the resource. Authentication will not help.' },
  { code: 404, name: 'Not Found', category: '4xx', description: 'The server cannot find the requested resource. The URL does not exist.' },
  { code: 405, name: 'Method Not Allowed', category: '4xx', description: 'The HTTP method is not allowed for this endpoint.' },
  { code: 408, name: 'Request Timeout', category: '4xx', description: 'The server timed out waiting for the request to complete.' },
  { code: 409, name: 'Conflict', category: '4xx', description: 'The request conflicts with the current state of the resource (e.g., duplicate entry).' },
  { code: 410, name: 'Gone', category: '4xx', description: 'The resource is permanently deleted and will not be available again.' },
  { code: 413, name: 'Payload Too Large', category: '4xx', description: 'The request body exceeds the server\'s configured limit.' },
  { code: 422, name: 'Unprocessable Entity', category: '4xx', description: 'The request was well-formed but contains semantic errors (validation failed).' },
  { code: 429, name: 'Too Many Requests', category: '4xx', description: 'The client has sent too many requests in a given time window (rate limiting).' },
  // 5xx
  { code: 500, name: 'Internal Server Error', category: '5xx', description: 'A generic server error. The server encountered an unexpected condition.' },
  { code: 501, name: 'Not Implemented', category: '5xx', description: 'The server does not support the functionality required to fulfill the request.' },
  { code: 502, name: 'Bad Gateway', category: '5xx', description: 'The server, acting as a gateway, received an invalid response from an upstream server.' },
  { code: 503, name: 'Service Unavailable', category: '5xx', description: 'The server is temporarily unavailable (maintenance or overload).' },
  { code: 504, name: 'Gateway Timeout', category: '5xx', description: 'The server, acting as a gateway, did not receive a timely response from an upstream server.' },
  { code: 507, name: 'Insufficient Storage', category: '5xx', description: 'WebDAV: The server cannot store the representation needed to complete the request.' },
];

const CATEGORY_COLORS: Record<string, string> = {
  '1xx': 'info',
  '2xx': 'success',
  '3xx': 'warning',
  '4xx': 'error',
  '5xx': 'error',
};

const CATEGORIES = ['1xx', '2xx', '3xx', '4xx', '5xx'];

export default function HttpStatusTool() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = HTTP_CODES;
    if (selectedCategory) result = result.filter((c) => c.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        String(c.code).includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, selectedCategory]);

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, name, or description…"
          className="flex-1 min-w-48 h-9 px-3 rounded-lg border border-border bg-surface-elevated text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Search HTTP status codes" />
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              aria-pressed={selectedCategory === cat}
              className={cn('px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all',
                selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface-elevated border-border text-foreground-muted hover:text-foreground')}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2" role="list" aria-label="HTTP status codes">
        {filtered.map((code) => (
          <div key={code.code} role="listitem"
            className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
            <div className="flex flex-col items-center gap-1 shrink-0 w-14 text-center">
              <code className="text-2xl font-bold font-mono text-foreground">{code.code}</code>
              <Badge variant={CATEGORY_COLORS[code.category] as 'success' | 'error' | 'warning' | 'info'}>
                {code.category}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{code.name}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed">{code.description}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-foreground-subtle">No status codes match your search</div>
        )}
      </div>
    </div>
  );
}
