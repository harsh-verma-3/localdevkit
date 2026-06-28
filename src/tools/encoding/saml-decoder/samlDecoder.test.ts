import { describe, it, expect } from 'vitest';
import { extractSamlPayload, decodeSaml } from './samlDecoder.logic';

// Helper to compress string using native CompressionStream in Node 18+
async function compressToRedirectPayload(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const response = new Response(cs.readable);
  const arrayBuffer = await response.arrayBuffer();
  
  const uint8 = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

describe('SAML Extraction', () => {
  it('extracts SAMLRequest from URL', () => {
    const rawUrl = 'https://sso.example.com/adfs/ls/?SAMLRequest=fZJNT8MwDIb%2FSpR7ky8H2tIIEFpYEkzAhgQnN6lrdYuW5MSWpWJ%2FnwWGDsRxif3YzzvOk1zFtr6eujP8W1%2FDugY27W0tqPZc%2Bs04T4PkmYssy%2FOqfVrnG4b7h5U%2FM9o%2FT8N13n4lMh9FmqRFWpRZUXwT%2B61sNoOryFq6vYlqXm7D1m0i3Z3R4U2U0m2S0W1Z1Y7Hsh8l6pY8v46C1M7S34oPUpJ1GvNisJ89gG%2BdT6gCawJjI5yNsTa4wG40gqNq2tD9Qp0O3B3yqA%2FMqI%2F8aI6YUYf4o02H8HHYHqV%2FGqQ7WfA%2BYR94j1m646x6x1n12GZ7OOp0%2BhQ%2BMf1U%2BO3hN0rO3F3657Cdb49v29OtbD7k%2BR7nQ17s2X8H7HwHHU%2B7j%2FH74XfE78QJexd%2FOP%2BrgNf4iXqQ5e5e%2FHH8rQGuxdf0F8e3G8BtfE2%2B8n36q%2FeW3%2FkD%3D%3D';
    const payload = extractSamlPayload(rawUrl);
    // URLSearchParams automatically decodes URI component
    expect(payload).toContain('fZJNT8');
  });

  it('extracts SAMLResponse from URL', () => {
    const rawUrl = 'https://sso.example.com/adfs/ls/?SAMLResponse=fVJRT4MwEP4rS99LoSCIsUnMDDPGjImJL0tfpY2WDktZq9n%2BvR14M2ZbfL2%2B3e9e7zodqNbr5tSZ%2B9bZgTsa2DR3taDadOm35SJL4tWCRHFeVPWDKtkx3N0v3Gk879ZpOM%2BbDxLHb5GkSZEXZVbEPsve8rYNd9lTeq2OqF6sw1puQu2e2e7NFNINUqObsqpdB2U3iNRNcfobR6id1a8VP6Rk3ZpkPlj3HqCLzgfaAWvK2SFr42zwirPq3a5s5e2d%2Bhg4O%2Bjx2I24Ucf249se4WPc3pT%2BGNgPteE9xj7wHqN0x7vqOaeeG2%2BPK%2F5N71g8c0%2Bf2O0m%2FA55vE2HPP9jf8m2v4Oed0DHI9zx2O72kKfxhR2d00G%2BRn40%2BPvT32K95Vd0n%2F9b3h%2Bffv9c%2FA8%3D';
    const payload = extractSamlPayload(rawUrl);
    expect(payload).toContain('fVJRT4MwEP4r');
  });

  it('decodes percent-encoded raw strings', () => {
    const rawEncoded = 'fZJNT8MwDIb%2FSpR7ky8H2tII';
    const payload = extractSamlPayload(rawEncoded);
    expect(payload).toBe('fZJNT8MwDIb/SpR7ky8H2tII');
  });
});

describe('SAML Decoding logic', () => {
  const xmlSample = '<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_abc123" Version="2.0" IssueInstant="2026-06-28T12:00:00Z"></samlp:AuthnRequest>';

  it('decodes HTTP-POST binding (Base64 only) successfully', async () => {
    const postPayload = btoa(xmlSample);
    const result = await decodeSaml(postPayload, 'post');
    expect(result.output).toBe(xmlSample);
    expect(result.detectedMode).toBe('post');
  });

  it('decodes HTTP-Redirect binding (Base64 + Inflate) successfully', async () => {
    const redirectPayload = await compressToRedirectPayload(xmlSample);
    const result = await decodeSaml(redirectPayload, 'redirect');
    expect(result.output).toBe(xmlSample);
    expect(result.detectedMode).toBe('redirect');
  });

  it('auto-detects HTTP-Redirect binding successfully', async () => {
    const redirectPayload = await compressToRedirectPayload(xmlSample);
    const result = await decodeSaml(redirectPayload, 'auto');
    expect(result.output).toBe(xmlSample);
    expect(result.detectedMode).toBe('redirect');
  });

  it('auto-detects HTTP-POST binding successfully', async () => {
    const postPayload = btoa(xmlSample);
    const result = await decodeSaml(postPayload, 'auto');
    expect(result.output).toBe(xmlSample);
    expect(result.detectedMode).toBe('post');
  });

  it('throws helpful error message on invalid input', async () => {
    await expect(decodeSaml('invalid-base64!', 'redirect')).rejects.toThrow();
    await expect(decodeSaml('YQ==', 'redirect')).rejects.toThrow(); // valid base64 for 'a', but invalid deflate
  });
});
