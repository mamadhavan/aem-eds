export default function (sidekick) {
  sidekick.addButton({
    id: 'screenshot',
    text: 'Screenshot',
    action: async () => {
      console.log('CLICK WORKED');
      alert('clicked');

      const currentUrl =
        sidekick.location?.href || window.location.href;

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
        console.error(e);
        alert(`Screenshot failed: ${e.message}`);
      }
    },
  });
}
