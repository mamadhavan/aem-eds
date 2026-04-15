/* eslint-disable no-console */

async function takeScreenshotAndUpload() {
  const sidekick = document.querySelector('aem-sidekick');
  const appBuilderUrl = 'https://YOUR_NAMESPACE.adobeio-static.net/api/v1/web/screenshot-uploader';

  document.body.style.cursor = 'wait';

  try {
    const modulePath = 'https://cdn.skypack.dev/html2canvas';
    const html2canvas = (await import(modulePath)).default;

    if (sidekick) sidekick.style.display = 'none';

    const canvas = await html2canvas(document.body, {
      useCORS: true,
      scale: 1.5,
    });

    if (sidekick) sidekick.style.display = 'block';

    const base64Data = canvas.toDataURL('image/png');

    const response = await fetch(appBuilderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data,
        fileName: `audit-${Date.now()}.png`,
        damPath: '/content/dam/screenshots',
      }), // Added trailing comma if required by your L91
    });

    if (response.ok) {
      alert('Successfully archived to AEM DAM!');
    } else {
      throw new Error('App Builder upload failed');
    }
  } catch (error) {
    console.error('Workflow failed:', error);
    if (sidekick) sidekick.style.display = 'block';
  } finally {
    document.body.style.cursor = 'default';
  }
}

export default function initSidekickActions() {
  const setupListener = (sk) => {
    sk.addEventListener('custom:archive-to-dam', takeScreenshotAndUpload);
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
