export default function addScreenshotPlugin(sidekick) {
  sidekick.add({
    id: 'screenshot',
    button: {
      text: 'Screenshot',
      action: async () => {
        const currentUrl = window.location.href;

        try {
          const response = await fetch(
            'https://42794-aemedsss-stage.adobeio-static.net/api/v1/web/aem-eds-ss/screenshot?url=' + encodeURIComponent(currentUrl)
          );

          const base64 = await response.text();

          const img = document.createElement('img');
          img.src = 'data:image/png;base64,' + base64;

          const win = window.open('');
          win.document.write(img.outerHTML);

        } catch (e) {
          alert('Screenshot failed: ' + e.message);
        }
      }
    }
  });
}
