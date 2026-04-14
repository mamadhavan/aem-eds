/* eslint-disable no-console */

/**
 * Prepares the page by forcing all lazy-loaded images to load immediately.
 */
async function prepareImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach((img) => {
    const image = img;
    image.loading = 'eager';
    image.fetchPriority = 'high';
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 800);
  });
}

/**
 * Captures the 'main' content of the AEM page as a PNG.
 */
async function takeFullPageScreenshot() {
  const root = document.querySelector('main');
  if (!root) return;

  document.body.style.cursor = 'wait';

  try {
    // Dynamic import to bypass the "Unable to resolve path" build error
    const htmlToImage = await import('https://cdn.skypack.dev/html-to-image');
    
    const dataUrl = await htmlToImage.toPng(root, {
      cacheBust: true,
      skipFonts: true,
      bgcolor: '#ffffff',
      style: {
        transform: 'none',
      },
    });

    const link = document.createElement('a');
    link.download = `aem-capture-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Screenshot capture failed:', error);
  } finally {
    document.body.style.cursor = 'default';
  }
}

/**
 * Main entry point called from scripts.js
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
      setupListener(document.querySelector('aem-sidekick'));
    }, { once: true });
  }
}
