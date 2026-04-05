/**
 * Captures a screenshot of the current page and downloads it.
 */
export async function takeScreenshot() {
  // Load html2canvas dynamically to keep the initial bundle small
  const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.js')).default;
  
  const body = document.querySelector('body');
  const canvas = await html2canvas(body, {
    useCORS: true, // Necessary if you have images from different domains
    logging: false,
  });

  // Create a download link
  const link = document.createElement('a');
  link.download = `screenshot-${new Date().getTime()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
