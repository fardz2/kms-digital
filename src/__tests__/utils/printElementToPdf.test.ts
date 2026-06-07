import { describe, expect, test, vi, beforeEach } from 'vitest';

const getPdfMock = vi.fn(() => Promise.resolve());
const html2pdfMock = vi.fn(function (_element: HTMLElement, _opt: { filename: string }) {
  return { getPdf: getPdfMock };
});

vi.mock('js-html2pdf', () => ({ default: html2pdfMock }));

import { printElementToPdf } from '../../utils/printElementToPdf';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('printElementToPdf', () => {
  test('throws when element is null', async () => {
    await expect(printElementToPdf(null, 'x.pdf')).rejects.toThrow();
  });

  test('calls html2pdf with element and filename then downloads', async () => {
    const el = document.createElement('div');
    await printElementToPdf(el, 'Kartu.pdf');
    expect(html2pdfMock).toHaveBeenCalledTimes(1);
    const [passedEl, opt] = html2pdfMock.mock.calls[0];
    expect(passedEl).toBe(el);
    expect(opt.filename).toBe('Kartu.pdf');
    expect(getPdfMock).toHaveBeenCalledWith(true);
  });
});
