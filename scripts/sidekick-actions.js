import * as htmlToImage from 'https://cdn.skypack.dev/html-to-image';

/**
 * Prepares the page by forcing all lazy-loaded images to load immediately.
 */
async function prepareImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach((img) => {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  });

  // Wait a moment for the browser to decode the images
  return new Promise((resolve) => setTimeout(resolve, 800));
}

/**
 * Captures the 'main' content of the AEM page as a PNG.
 */
async function takeFullPageScreenshot() {
  const root = document.querySelector('main');
  if (!root) return;

  // Show visual feedback
  document.body.style.cursor = 'wait';

  try {
    // We use toPng with specific EDS-friendly options
    const dataUrl = await htmlToImage.toPng(root, {
      cacheBust: true,      // Essential for CORS issues
      skipFonts: true,      // Speeds up processing
      bgcolor: '#ffffff',   // Prevents transparent backgrounds
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
      console.log('Preparing page for screenshot...');
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
