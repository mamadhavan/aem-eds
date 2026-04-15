/* eslint-disable no-console */

async function takeScreenshotAndUpload() {
  console.log('Capture event triggered');
  const appBuilderUrl = 'https://42794-snapshot-stage.adobeio-static.net/api/v1/web/aem-eds-ss/screenshot-v7';
  try {
    // eslint-disable-next-line import/no-unresolved
    const html2canvas = (await import('https://cdn.skypack.dev/html2canvas')).default;
    const canvas = await html2canvas(document.body, { useCORS: true, scale: 1 });
    const base64Data = canvas.toDataURL('image/jpeg', 0.5);
    console.log('Original Size estimate:', (base64Data.length / 1024).toFixed(2), 'KB');
    const response = await fetch(appBuilderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data,
        fileName: `audit-${Date.now()}.png`,
        damPath: '/content/dam/screenshots',
      }),
    });

    if (response.ok) alert('Successfully uploaded to AEM DAM!');
    else alert('App Builder Error: Check your actions logs');
  } catch (e) {
    console.error('Screenshot failed', e);
  }
}

export default function initSidekickActions() {
  // This will show up in your console to prove it loaded
  console.log('Sidekick Action 1: Initializing...');

  const setup = (sk) => {
    sk.addEventListener('custom:archive-to-dam', takeScreenshotAndUpload);
    console.log('Sidekick Action 1: Listener Attached!');
  };

  const sk = document.querySelector('aem-sidekick');
  if (sk) {
    setup(sk);
  } else {
    document.addEventListener('sidekick-ready', () => {
      setup(document.querySelector('aem-sidekick'));
    }, { once: true });
  }
}
