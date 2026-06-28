import { describe, it, expect } from 'vitest';
import { yamlToJson, jsonToYaml } from './yamlJson.logic';

// ─── yamlToJson() ─────────────────────────────────────────────────────────────

describe('yamlToJson()', () => {
  it('converts flat scalar YAML to JSON', async () => {
    const yaml = 'name: LocalDevKit\nversion: 1\nprivate: true';
    const result = JSON.parse(await yamlToJson(yaml));
    expect(result).toEqual({ name: 'LocalDevKit', version: 1, private: true });
  });

  it('converts nested YAML mapping to JSON', async () => {
    const yaml = 'database:\n  host: localhost\n  port: 5432';
    const result = JSON.parse(await yamlToJson(yaml));
    expect(result).toEqual({ database: { host: 'localhost', port: 5432 } });
  });

  it('converts YAML sequence to JSON array', async () => {
    const yaml = 'fruits:\n  - apple\n  - banana\n  - cherry';
    const result = JSON.parse(await yamlToJson(yaml));
    expect(result.fruits).toEqual(['apple', 'banana', 'cherry']);
  });

  it('converts YAML with multi-line string (literal block)', async () => {
    const yaml = 'message: |\n  Hello\n  World';
    const result = JSON.parse(await yamlToJson(yaml));
    expect(result.message).toContain('Hello');
    expect(result.message).toContain('World');
  });

  it('produces pretty-printed JSON (2-space indent)', async () => {
    const result = await yamlToJson('a: 1');
    expect(result).toContain('  ');
    expect(result.startsWith('{')).toBe(true);
  });

  it('rejects with YAMLException for invalid YAML', async () => {
    await expect(yamlToJson('key: {broken')).rejects.toThrow();
  });
});

// ─── jsonToYaml() ─────────────────────────────────────────────────────────────

describe('jsonToYaml()', () => {
  it('converts a flat JSON object to YAML', async () => {
    const json = '{"name":"LocalDevKit","version":1}';
    const result = await jsonToYaml(json);
    expect(result).toContain('name: LocalDevKit');
    expect(result).toContain('version: 1');
  });

  it('converts a JSON array of objects to YAML', async () => {
    const json = '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]';
    const result = await jsonToYaml(json);
    expect(result).toContain('- id: 1');
    expect(result).toContain('  name: Alice');
  });

  it('converts nested JSON object to YAML', async () => {
    const json = '{"db":{"host":"localhost","port":5432}}';
    const result = await jsonToYaml(json);
    expect(result).toContain('db:');
    expect(result).toContain('  host: localhost');
  });

  it('rejects with SyntaxError for invalid JSON', async () => {
    await expect(jsonToYaml('{broken json')).rejects.toThrow(SyntaxError);
  });
});

// ─── Semantic Roundtrip ───────────────────────────────────────────────────────

describe('YAML ↔ JSON semantic roundtrip', () => {
  it('jsonToYaml → yamlToJson preserves data structure', async () => {
    const original = { name: 'Alice', age: 30, tags: ['admin', 'user'] };
    const json = JSON.stringify(original);
    const yaml = await jsonToYaml(json);
    const recovered = JSON.parse(await yamlToJson(yaml));
    expect(recovered).toEqual(original);
  });

  it('yamlToJson → jsonToYaml preserves data structure', async () => {
    const yaml = 'name: Bob\nactive: true\nscores:\n  - 90\n  - 85';
    const json = await yamlToJson(yaml);
    const yaml2 = await jsonToYaml(json);
    const recovered = JSON.parse(await yamlToJson(yaml2));
    expect(recovered.name).toBe('Bob');
    expect(recovered.active).toBe(true);
    expect(recovered.scores).toEqual([90, 85]);
  });
});
