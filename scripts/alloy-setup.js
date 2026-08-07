const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853'; // ← Your actual ID
const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg'; // ← Your actual Org ID

export default function loadAlloy() {
  return new Promise((resolve, reject) => {
    // Prevent re-initialization
    if (window.alloy && window.alloy.configured) {
      resolve();
      return;
    }

    // Step 1: Register instance name and queue stub BEFORE script loads
    window.__alloyNS = window.__alloyNS || [];
    if (!window.__alloyNS.includes('alloy')) {
      window.__alloyNS.push('alloy');
    }

    // Queue stub: if script hasn't loaded yet, queue calls
    window.alloy = window.alloy || function alloy(...args) {
      (window.alloy.q = window.alloy.q || []).push(args);
    };
    window.alloy.q = window.alloy.q || [];

    // Step 2: Inject the alloy.js script
    const script = document.createElement('script');
    script.src = 'https://cdn1.adoberesources.net/alloy/2.20.0/alloy.min.js';
    script.async = true;

    script.addEventListener('load', () => {
      // Step 3: Wait for the real alloy to replace the stub
      const check = setInterval(() => {
        // Real alloy replaces the stub and removes .q
        if (window.alloy && typeof window.alloy === 'function' && !window.alloy.q) {
          clearInterval(check);
          // Step 4: Configure with your datastream
          window.alloy('configure', {
            datastreamId: DATASTREAM_ID,
            orgId: ORG_ID,
            defaultConsent: 'in',
            renderDecisions: false, // We handle rendering manually in blocks
          });
          window.alloy.configured = true;
          resolve();
        }
      }, 50);

      // Failsafe: timeout after 3s and resolve anyway (may degrade gracefully)
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 3000);
    });

    script.addEventListener('error', () => {
      reject(new Error('[Alloy] Failed to load alloy.js'));
    });

    document.head.appendChild(script);
  });
}
