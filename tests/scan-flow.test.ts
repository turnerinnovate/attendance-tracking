import { describe, it, expect } from 'vitest';
import { generateCamperCode, hashToken } from '../lib/codes';

describe('scan/checkin smoke', () => {
  it('generates non-empty secure identifiers', () => {
    expect(generateCamperCode('DEMO')).toMatch(/^DEMO-\d{4}-[A-F0-9]{4}$/);
    expect(hashToken('abc')).toHaveLength(64);
  });
});
