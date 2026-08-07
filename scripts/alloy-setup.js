export default function loadAlloy() {
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (window.alloy && typeof window.alloy === 'function') {
        clearInterval(check);
        resolve();
      }
    }, 50);

    setTimeout(() => {
      clearInterval(check);
      console.error('[Target] window.alloy is not available after loadAlloy()');
      resolve();
    }, 3000);
  });
}