/**
* Captures a screenshot of the current page and downloads it.
*/
export async function takeScreenshot() {
 // 1. Dynamic import of html2canvas to keep the site fast
 const { default: html2canvas } = await import('https://jspm.dev/html2canvas');
 // 2. Options to handle AEM EDS specific needs (like CORS for images)
 const options = {
   useCORS: true,
   allowTaint: true,
   scrollY: -window.scrollY, // Ensures it captures from the top of the page
   ignoreElements: (el) => el.classList.contains('hlx-sidekick'), // Hide sidekick in screenshot
 };
 const canvas = await html2canvas(document.body, options);
 // 3. Create a download link
 const link = document.createElement('a');
 link.download = `preview-${new Date().toISOString().slice(0, 10)}.png`;
 link.href = canvas.toDataURL('image/png');
 link.click();
}
// Ensure the function is available to the Sidekick
window.hlx = window.hlx || {};
window.hlx.takeScreenshot = takeScreenshot;
