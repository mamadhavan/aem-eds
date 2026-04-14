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

    const canvas = await html2canvas(root, {
      useCORS: true,
      scale: 1.5,
      scrollY: -window.scrollY,
      backgroundColor: window.getComputedStyle(document.body).backgroundColor,
    });

    if (sidekick) sidekick.style.display = 'block';

    const link = document.createElement('a');
    link.download = `screenshot-${Date.now()}.png`;
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