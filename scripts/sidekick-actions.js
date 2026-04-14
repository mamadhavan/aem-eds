
/* eslint-disable no-console */

/**
 * Prepares the page by forcing all lazy-loaded images to load immediately.
 */
async function prepareImages() {
  const images = document.querySelectorAll('main img');

  for (const img of images) {
    // 1. Remove lazy loading
    img.loading = 'eager';

    // 2. If it's part of a <picture>, find the active source
    const picture = img.closest('picture');
    if (picture) {
      const source = picture.querySelector('source');
      if (source && source.srcset) {
        // Force the img.src to be the high-res source
        img.src = source.srcset.split(' ')[0];
      }
    }

    // 3. Ensure the browser has actually painted the image
    if (!img.complete) {
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    }
  }
}

/**
 * Captures the 'main' content of the AEM page as a PNG.
 */
/* eslint-disable no-console */

async function takeFullPageScreenshot() {
  // 1. Target the entire body instead of just 'main'
  const root = document.body;
  const sidekick = document.querySelector('aem-sidekick');

  document.body.style.cursor = 'wait';

  try {
    const modulePath = 'https://cdn.skypack.dev/html2canvas';
    const html2canvas = (await import(modulePath)).default;

    // 2. Hide sidekick before capturing
    if (sidekick) sidekick.style.display = 'none';

    const canvas = await html2canvas(root, {
      useCORS: true,
      scale: 2,
      scrollY: -window.scrollY, // Fixes alignment if the user has scrolled
      backgroundColor: window.getComputedStyle(document.body).backgroundColor,
      // Ignore the sidekick if it's still in the DOM tree
      ignoreElements: (el) => el.tagName === 'AEM-SIDEKICK',
    });

    // 3. Restore sidekick immediately
    if (sidekick) sidekick.style.display = 'block';

    // --- TIMESTAMP LOGIC ---
    const ctx = canvas.getContext('2d');
    const timestamp = `${new Date().toLocaleString()} | ${window.location.hostname}`;

    ctx.font = '24px sans-serif';
    const textWidth = ctx.measureText(timestamp).width;
    const x = canvas.width - textWidth - 40;
    const y = canvas.height - 40;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - 20, y - 30, textWidth + 40, 50);

    ctx.fillStyle = 'white';
    ctx.fillText(timestamp, x, y);

    // 4. Download
    const link = document.createElement('a');
    link.download = `full-page-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Screenshot failed:', error);
    if (sidekick) sidekick.style.display = 'block';
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
      const sidekick = document.querySelector('aem-sidekick');
      if (sidekick) setupListener(sidekick);
    }, { once: true });
  }
}
