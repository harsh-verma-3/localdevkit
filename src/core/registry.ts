import type { ToolPlugin, ToolCategoryValue } from './types/plugin';
import dynamic from 'next/dynamic';

// ─────────────────────────────────────────────
// Tool Registry
// All tools are registered here. The registry is the single source of truth
// for routing, sidebar, command palette, sitemap, and SEO metadata.
// ─────────────────────────────────────────────

const registry: ToolPlugin[] = [
  // ── Encoding & Decoding ─────────────────────
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode text or files to and from Base64 format.',
    category: 'encoding',
    keywords: ['base64', 'encode', 'decode', 'binary', 'text', 'atob', 'btoa'],
    icon: 'binary',
    relatedTools: ['url-encode', 'html-entities'],
    component: dynamic(() => import('@/tools/encoding/base64/Base64Tool')),
  },
  {
    id: 'url-encode',
    name: 'URL Encoder / Decoder',
    description: 'Encode or decode URL components and query strings.',
    category: 'encoding',
    keywords: ['url', 'encode', 'decode', 'percent', 'uri', 'query', 'string', 'escape'],
    icon: 'link',
    relatedTools: ['base64', 'html-entities'],
    component: dynamic(() => import('@/tools/encoding/url-encode/UrlEncodeTool')),
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Token headers, payloads, and signatures.',
    category: 'encoding',
    keywords: ['jwt', 'json web token', 'decode', 'bearer', 'header', 'payload', 'auth', 'token'],
    icon: 'key-round',
    relatedTools: ['base64', 'json-formatter'],
    isNew: false,
    component: dynamic(() => import('@/tools/encoding/jwt-decoder/JwtDecoderTool')),
  },
  {
    id: 'html-entities',
    name: 'HTML Entity Encoder',
    description: 'Encode and decode HTML entities like &amp;, &lt;, &gt;, and more.',
    category: 'encoding',
    keywords: ['html', 'entity', 'encode', 'decode', 'escape', 'amp', 'lt', 'gt', 'nbsp'],
    icon: 'code-xml',
    relatedTools: ['base64', 'url-encode'],
    component: dynamic(() => import('@/tools/encoding/html-entities/HtmlEntitiesToolLazy')),
  },

  // ── Data Transformation ──────────────────────
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, minify, and inspect JSON data with syntax highlighting.',
    category: 'data',
    keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty', 'print', 'lint'],
    icon: 'braces',
    relatedTools: ['yaml-json', 'csv-json', 'jwt-decoder'],
    shortcut: 'mod+shift+j',
    component: dynamic(() => import('@/tools/data/json-formatter/JsonFormatterTool')),
  },
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    description: 'Convert between YAML and JSON formats bidirectionally.',
    category: 'data',
    keywords: ['yaml', 'json', 'convert', 'transform', 'yml', 'config'],
    icon: 'arrow-left-right',
    relatedTools: ['json-formatter', 'csv-json'],
    component: dynamic(() => import('@/tools/data/yaml-json/YamlJsonTool')),
  },
  {
    id: 'csv-json',
    name: 'CSV ↔ JSON',
    description: 'Convert between CSV and JSON formats. Supports headers and custom delimiters.',
    category: 'data',
    keywords: ['csv', 'json', 'convert', 'table', 'excel', 'spreadsheet', 'delimiter'],
    icon: 'table',
    relatedTools: ['json-formatter', 'yaml-json'],
    component: dynamic(() => import('@/tools/data/csv-json/CsvJsonTool')),
  },

  // ── Generators ───────────────────────────────
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate universally unique identifiers (UUID v4 and v7) in bulk.',
    category: 'generators',
    keywords: ['uuid', 'guid', 'unique', 'id', 'identifier', 'v4', 'v7', 'random'],
    icon: 'fingerprint',
    relatedTools: ['password-generator', 'hash-generator'],
    component: dynamic(() => import('@/tools/generators/uuid-generator/UuidGeneratorTool')),
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, cryptographically secure passwords with custom rules.',
    category: 'generators',
    keywords: ['password', 'generate', 'secure', 'random', 'strong', 'passphrase', 'entropy'],
    icon: 'shield-check',
    relatedTools: ['uuid-generator', 'hash-generator'],
    component: dynamic(() => import('@/tools/generators/password-generator/PasswordGeneratorTool')),
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate cryptographic hashes (SHA-256, SHA-512) using the browser WebCrypto API. Nothing leaves your device.',
    category: 'generators',
    keywords: ['hash', 'sha256', 'sha512', 'sha', 'checksum', 'crypto', 'digest', 'hmac'],
    icon: 'hash',
    relatedTools: ['password-generator', 'uuid-generator'],
    component: dynamic(() => import('@/tools/generators/hash-generator/HashGeneratorTool')),
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from any text or URL. Download as PNG or SVG.',
    category: 'generators',
    keywords: ['qr', 'qr code', 'barcode', 'scan', 'url', 'link', 'generate'],
    icon: 'qr-code',
    relatedTools: ['uuid-generator'],
    component: dynamic(() => import('@/tools/generators/qr-generator/QrGeneratorTool')),
  },

  // ── Text Utilities ───────────────────────────
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time match highlighting and capture group inspection.',
    category: 'text',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'match', 'test', 'groups', 'flags'],
    icon: 'regex',
    relatedTools: ['diff-viewer', 'case-converter'],
    component: dynamic(() => import('@/tools/text/regex-tester/RegexTesterTool')),
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between camelCase, snake_case, kebab-case, PascalCase, UPPER_CASE, and more.',
    category: 'text',
    keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', 'upper', 'lower', 'title', 'convert'],
    icon: 'case-sensitive',
    relatedTools: ['regex-tester', 'word-counter'],
    component: dynamic(() => import('@/tools/text/case-converter/CaseConverterTool')),
  },
  {
    id: 'diff-viewer',
    name: 'Text Diff',
    description: 'Compare two blocks of text and highlight the differences line by line.',
    category: 'text',
    keywords: ['diff', 'compare', 'difference', 'text', 'patch', 'change', 'delta', 'merge'],
    icon: 'git-diff',
    relatedTools: ['regex-tester'],
    component: dynamic(() => import('@/tools/text/diff-viewer/DiffViewerTool')),
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, paragraphs, and reading time in any text.',
    category: 'text',
    keywords: ['word', 'count', 'character', 'letter', 'paragraph', 'sentence', 'reading time'],
    icon: 'text-cursor-input',
    relatedTools: ['case-converter', 'regex-tester'],
    component: dynamic(() => import('@/tools/text/word-counter/WordCounterTool')),
  },

  // ── Date & Time ──────────────────────────────
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa across timezones.',
    category: 'datetime',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'iso', 'utc', 'convert', 'timezone'],
    icon: 'clock-arrow-up',
    relatedTools: [],
    component: dynamic(() => import('@/tools/datetime/timestamp-converter/TimestampConverterTool')),
  },

  // ── Preview ──────────────────────────────────
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Write and preview Markdown with live rendering and syntax highlighting.',
    category: 'preview',
    keywords: ['markdown', 'md', 'preview', 'render', 'html', 'wysiwyg', 'github', 'gfm'],
    icon: 'file-text',
    relatedTools: ['diff-viewer'],
    component: dynamic(() => import('@/tools/preview/markdown-preview/MarkdownPreviewTool')),
  },

  // ── Reference ────────────────────────────────
  {
    id: 'http-status',
    name: 'HTTP Status Codes',
    description: 'Browse all HTTP status codes with descriptions, use cases, and RFC references.',
    category: 'reference',
    keywords: ['http', 'status', 'code', '200', '404', '500', 'rest', 'api', 'response'],
    icon: 'server',
    relatedTools: ['url-encode'],
    component: dynamic(() => import('@/tools/reference/http-status/HttpStatusTool')),
  },
];

// ─────────────────────────────────────────────
// Registry Accessors
// ─────────────────────────────────────────────

export function getAllTools(): ToolPlugin[] {
  return registry.filter((t) => t.stable !== false);
}

export function getToolById(id: string): ToolPlugin | undefined {
  return registry.find((t) => t.id === id);
}

export function getToolsByCategory(category: ToolCategoryValue): ToolPlugin[] {
  return registry.filter((t) => t.category === category && t.stable !== false);
}

export function getRelatedTools(toolId: string): ToolPlugin[] {
  const tool = getToolById(toolId);
  if (!tool?.relatedTools) return [];
  return tool.relatedTools
    .map((id) => getToolById(id))
    .filter((t): t is ToolPlugin => t !== undefined);
}

export function searchTools(query: string): ToolPlugin[] {
  const q = query.toLowerCase().trim();
  if (!q) return getAllTools();
  return registry.filter(
    (t) =>
      t.stable !== false &&
      (t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q)))
  );
}

export { registry };
