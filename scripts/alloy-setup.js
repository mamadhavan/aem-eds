const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg';

export default function loadAlloy() {
  return new Promise((resolve, reject) => {
    console.log('[DEBUG] loadAlloy() called');

    // If alloy is already loaded and configured, done
    if (window.alloy && typeof window.alloy === 'function' && window.alloy._configured) {
      console.log('[DEBUG] Alloy already configured');
      resolve();
      return;
    }

    // If script is already in DOM, just wait for it
    if (document.querySelector('script[src*="alloy"]')) {
      console.log('[DEBUG] Alloy script already in DOM, polling for readiness');
      waitForAlloy().then(resolve).catch(reject);
      return;
    }

    console.log('[DEBUG] Loading alloy script from CDN');

    const script = document.createElement('script');
    script.src = 'https://cdn1.adoberesources.net/alloy/2.20.0/alloy.min.js';
    script.async = true;

    script.addEventListener('load', () => {
      console.log('[DEBUG] Alloy script loaded');
      waitForAlloy().then(resolve).catch(reject);
    });

    script.addEventListener('error', () => {
      console.error('[ERROR] Failed to load alloy script');
      reject(new Error('Failed to load alloy.js from CDN'));
    });

    document.head.appendChild(script);
  });
}

/**
 * Wait for alloy to be a real, callable function (not a stub)
 */
function waitForAlloy() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // 100 * 100ms = 10 seconds

    const check = setInterval(() => {
      attempts += 1;

      // Check if alloy is a real function we can call
      if (typeof window.alloy === 'function') {
        console.log(`[DEBUG] Poll #${attempts}: alloy is ready!`);
        clearInterval(check);

        // Configure it
        try {
          window.alloy('configure', {
            datastreamId: DATASTREAM_ID,
            orgId: ORG_ID,
            defaultConsent: 'in',
            renderDecisions: false,
          });

          // Mark as configured
          window.alloy._configured = true;
          console.log('[SUCCESS] Alloy configured successfully');
          resolve();
        } catch (err) {
          console.error('[ERROR] Failed to configure alloy:', err);
          reject(err);
        }
      } else {
        if (attempts % 10 === 0) {
          console.log(`[DEBUG] Waiting for alloy... attempt ${attempts}/${maxAttempts}`);
        }
      }

      // Timeout after maxAttempts
      if (attempts >= maxAttempts) {
        clearInterval(check);
        console.error('[ERROR] Timeout waiting for alloy to load');
        reject(new Error('Alloy failed to load within timeout'));
      }
    }, 100);
  });
}
