/**
 * Captures a screenshot of the current page and downloads it.
 */
export default async function takeScreenshot() {
  const url = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.js';
  /* eslint-disable-next-line import/no-unresolved */
  const html2canvas = (await import(url)).default;

  const body = document.querySelector('body');
  const canvas = await html2canvas(body, {
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = `screenshot-${new Date().getTime()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
