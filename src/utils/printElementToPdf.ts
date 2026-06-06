const DEFAULT_OPT = {
  margin: [12, 12, 12, 12],
  image: { type: 'jpeg', quality: 0.95 },
  html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
};

export async function printElementToPdf(
  element: HTMLElement | null,
  filename: string,
): Promise<void> {
  if (!element) {
    throw new Error('Elemen untuk dicetak tidak tersedia');
  }
  // react-doctor-disable-next-line -- dynamic import() intentionally code-splits the heavy js-html2pdf lib.
  const mod = await import('js-html2pdf');
  const html2pdf = (mod as any).default ?? mod;
  const opt = { ...DEFAULT_OPT, filename };
  await html2pdf(element, opt).save();
}
