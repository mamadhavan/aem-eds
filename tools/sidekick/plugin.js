export default function addScreenshotPlugin(sidekick) {
  sidekick.add({
    id: 'screenshot',
    button: {
      text: 'Screenshot',
      action: async () => {
        const currentUrl = window.location.href;

        try {
          const apiUrl = `https://runtime.adobe.io/api/v1/web/.../screenshot?url=${encodeURIComponent(
            currentUrl,
          )}`;

          const response = await fetch(apiUrl);
          const base64 = await response.text();

          const link = document.createElement('a');
          link.href = `data:image/png;base64,${base64}`;
          link.download = 'screenshot.png';
          link.click();
        } catch (e) {
          // eslint-disable-next-line no-alert
          alert(`Screenshot failed: ${e.message}`);
        }
      },
    },
  });
}
