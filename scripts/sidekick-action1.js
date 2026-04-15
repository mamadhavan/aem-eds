/* eslint-disable no-console */

async function takeScreenshotAndUpload() {
  console.log('Capture started...');
  const sidekick = document.querySelector('aem-sidekick');
  const appBuilderUrl = 'https://YOUR_NAMESPACE.adobeio-static.net/api/v1/web/screenshot-uploader';
  
  try {
    const modulePath = 'https://cdn.skypack.dev/html2canvas';
    const html2canvas = (await import(modulePath)).default;

    if (sidekick) sidekick.style.display = 'none';
    const canvas = await html2canvas(document.body, { useCORS: true, scale: 1.5 });
    if (sidekick) sidekick.style.display = 'block';

    const base64Data = canvas.toDataURL('image/png');

    const response = await fetch(appBuilderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data,
        fileName: `audit-${Date.now()}.png`,
        damPath: '/content/dam/screenshots',
      }),
    });

    if (response.ok) alert('Successfully archived!');
    else alert('Upload failed. Check App Builder logs.');
  } catch (e) {
    console.error(e);
    if (sidekick) sidekick.style.display = 'block';
  }
}

// THIS PART IS CRITICAL
export default function initSidekickActions() {
  console.log('Initializing Sidekick Listeners...');
  const sk = document.querySelector('aem-sidekick');
  
  if (sk) {
    sk.addEventListener('custom:archive-to-dam', takeScreenshotAndUpload);
    console.log('Event listener attached to sidekick');
  } else {
    console.warn('Sidekick not found yet, waiting for sidekick-ready event');
    document.addEventListener('sidekick-ready', () => {
      const lateSk = document.querySelector('aem-sidekick');
      lateSk.addEventListener('custom:archive-to-dam', takeScreenshotAndUpload);
      console.log('Event listener attached after sidekick-ready');
    }, { once: true });
  }
}