/**
 * SAML XML Decompression and Decoding Logic.
 */

/**
 * Checks if the input is a URL or query string and extracts the SAML payload if present.
 */
export function extractSamlPayload(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes('?') || trimmed.includes('&') || trimmed.includes('SAMLRequest=') || trimmed.includes('SAMLResponse=')) {
    try {
      const queryString = trimmed.includes('?') ? trimmed.split('?')[1] : trimmed;
      const params = new URLSearchParams(queryString);
      const samlReq = params.get('SAMLRequest');
      const samlResp = params.get('SAMLResponse');
      if (samlReq) return samlReq; // URLSearchParams already handles URL-decoding
      if (samlResp) return samlResp;
    } catch {
      // ignore parsing error, fallback to raw input
    }
  }
  
  // If there are percent signs, URL decode it first
  if (trimmed.includes('%')) {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      // ignore, fallback
    }
  }

  return trimmed;
}

/**
 * Converts a Base64 string to a Uint8Array of bytes.
 */
export function base64ToBytes(base64: string): Uint8Array {
  // Normalize base64: strip whitespace, replace url-safe chars
  const normalized = base64
    .replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const binaryString = atob(normalized);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decompresses raw DEFLATE bytes into a string.
 */
export async function decompressRaw(bytes: Uint8Array): Promise<string> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    }
  });
  const decompressed = stream.pipeThrough(new DecompressionStream('deflate-raw'));
  const response = new Response(decompressed);
  const arrayBuffer = await response.arrayBuffer();
  return new TextDecoder('utf-8').decode(arrayBuffer);
}

export type SamlDecodeMode = 'auto' | 'redirect' | 'post';

export interface SamlDecodeResult {
  output: string;
  detectedMode: 'redirect' | 'post';
  error?: string;
}

/**
 * Decodes a SAMLRequest or SAMLResponse payload based on the selected mode.
 */
export async function decodeSaml(input: string, mode: SamlDecodeMode): Promise<SamlDecodeResult> {
  const payload = extractSamlPayload(input);
  if (!payload) {
    return { output: '', detectedMode: 'post' };
  }

  // Helper to decode Base64 only (HTTP POST Binding)
  const decodePost = (rawPayload: string): string => {
    const bytes = base64ToBytes(rawPayload);
    return new TextDecoder('utf-8').decode(bytes);
  };

  // Helper to decode Base64 + Decompress (HTTP Redirect Binding)
  const decodeRedirect = async (rawPayload: string): Promise<string> => {
    const bytes = base64ToBytes(rawPayload);
    return await decompressRaw(bytes);
  };

  if (mode === 'redirect') {
    try {
      const decoded = await decodeRedirect(payload);
      return { output: decoded, detectedMode: 'redirect' };
    } catch (err) {
      throw new Error(`Failed to decode as HTTP-Redirect binding (Base64 + Deflate): ${(err as Error).message}`);
    }
  }

  if (mode === 'post') {
    try {
      const decoded = decodePost(payload);
      return { output: decoded, detectedMode: 'post' };
    } catch (err) {
      throw new Error(`Failed to decode as HTTP-POST binding (Base64 only): ${(err as Error).message}`);
    }
  }

  // Auto-detect: first try HTTP-Redirect, then HTTP-POST
  try {
    const decoded = await decodeRedirect(payload);
    // Double check if the output starts with XML tags to verify successful decompression
    if (decoded.trim().startsWith('<')) {
      return { output: decoded, detectedMode: 'redirect' };
    }
    // If it's valid UTF-8 but doesn't look like XML, let's keep trying POST binding just in case
  } catch {
    // Ignore error and try POST binding
  }

  try {
    const decoded = decodePost(payload);
    return { output: decoded, detectedMode: 'post' };
  } catch (err) {
    throw new Error(`Could not decode SAML payload. Tried both HTTP-Redirect and HTTP-POST. Error: ${(err as Error).message}`);
  }
}
