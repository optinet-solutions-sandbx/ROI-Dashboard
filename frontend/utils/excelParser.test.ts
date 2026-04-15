import { describe, it, expect } from 'vitest';
import { normalizeColumnName } from './excelParser';

describe('normalizeColumnName', () => {
  it('lowercases input', () => {
    expect(normalizeColumnName('Revenue')).toBe('revenue');
  });

  it('trims whitespace', () => {
    expect(normalizeColumnName('  date  ')).toBe('date');
  });

  it('replaces spaces with underscores', () => {
    expect(normalizeColumnName('first name')).toBe('first_name');
  });

  it('collapses multiple underscores', () => {
    expect(normalizeColumnName('a__b')).toBe('a_b');
  });

  it('strips trailing underscores', () => {
    expect(normalizeColumnName('hello!')).toBe('hello');
  });

  it('replaces non-alphanumeric chars with underscore', () => {
    expect(normalizeColumnName('Partner ID')).toBe('partner_id');
  });
});
