import { describe, test, expect } from 'vitest';
import { sanitizeHtml } from '../../utilities/sanitize';

describe('sanitizeHtml', () => {
  test('strips script tag', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Hello</p>');
  });

  test('strips onerror attribute', () => {
    const dirty = '<img src="x" onerror="alert(1)" />';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('onerror');
  });

  test('preserves allowed tags', () => {
    const dirty = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('<strong>');
    expect(clean).toContain('<em>');
  });

  test('preserves anchor with href', () => {
    const dirty = '<a href="https://example.com">link</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('href="https://example.com"');
  });

  test('handles null/undefined safely', () => {
    expect(sanitizeHtml('')).toEqual('');
    expect(sanitizeHtml(null)).toEqual('');
    expect(sanitizeHtml(undefined)).toEqual('');
  });
});
