/* eslint-disable no-console */
/**
 * Prepares the page by forcing all lazy-loaded images to load immediately.
 */
async function prepareImages() {
  const images = [...document.querySelectorAll('main img')];
  const promises = images.map((img) => {
    const image = img;
    image.loading = 'eager';
    image.fetchPriority = 'high';

    const picture = image.closest('picture');
    if (picture) {
      const source = picture.querySelector('source');
      if (source && source.srcset) {
        const [firstSrc] = source.srcset.split(' ');
        image.src = firstSrc;
      }
    }

    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.onload = resolve;
      image.onerror = resolve;
    });
  });

  await Promise.all(promises);
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
}

/**
 * Captures the page and downloads the result.
 */
async function takeFullPageScreenshot() {
  const root = document.body;
  const sidekick = document.querySelector('aem-sidekick');
  document.body.style.cursor = 'wait';

  try {
    const modulePath = 'https://cdn.skypack.dev/html2canvas';
    const html2canvasModule = await import(modulePath);
    const html2canvas = html2canvasModule.default;

    if (sidekick) sidekick.style.display = 'none';

    const scale = 1.5;
    const canvas = await html2canvas(root, {
      useCORS: true,
      scale,
      scrollY: -window.scrollY,
      backgroundColor: window.getComputedStyle(document.body).backgroundColor,
    });

    if (sidekick) sidekick.style.display = 'block';

    const ctx = canvas.getContext('2d');
    const timestamp = new Date().toLocaleString();

    // 1. Find all images that were part of the capture
    const images = document.querySelectorAll('main img');

    // 2. Set style for the stamps
    ctx.font = `${14 * scale}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4 * scale;

    images.forEach((img) => {
      const rect = img.getBoundingClientRect();

      // Calculate position on canvas relative to the body
      // We multiply by scale because the canvas is larger than the screen
      const x = (rect.left + window.scrollX) * scale;
      const y = (rect.top + window.scrollY) * scale;

      // Only stamp if the image is actually visible/has dimensions
      if (rect.width > 10 && rect.height > 10) {
        // Draw timestamp at the bottom-right of each image
        const padding = 10 * scale;
        const textWidth = ctx.measureText(timestamp).width;

        // Background for the text to ensure readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(
          x + (rect.width * scale) - textWidth - padding - 5,
          y + (rect.height * scale) - padding - (14 * scale),
          textWidth + 10,
          18 * scale
        );

        // Actual text
        ctx.fillStyle = 'white';
        ctx.fillText(
          timestamp,
          x + (rect.width * scale) - textWidth - padding,
          y + (rect.height * scale) - padding
        );
      }
    });

    const link = document.createElement('a');
    link.download = `stamped-capture-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Action failed:', error);
    if (sidekick) sidekick.style.display = 'block';
  } finally {
    document.body.style.cursor = 'default';
  }
}

/**
 * Main entry point
 */
export default function initSidekickActions() {
  const setupListener = (sidekick) => {
    sidekick.addEventListener('custom:hello', async () => {
      await prepareImages();
      await takeFullPageScreenshot();
    });
  };

  const sk = document.querySelector('aem-sidekick');
  if (sk) {
    setupListener(sk);
  } else {
    document.addEventListener('sidekick-ready', () => {
      const sidekick = document.querySelector('aem-sidekick');
      if (sidekick) setupListener(sidekick);
    }, { once: true });
  }
}
