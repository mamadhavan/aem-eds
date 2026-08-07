const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg';

export default function loadAlloy() {
  console.log('[DEBUG] loadAlloy() called');

  return new Promise((resolve, reject) => {
    // Check if real alloy is already there
    if (window.alloy && typeof window.alloy === 'function' && !window.alloy.q) {
      console.log('[DEBUG] Real alloy already initialized');
      resolve();
      return;
    }

    console.log('[DEBUG] Starting alloy initialization...');

    // CRITICAL: Set __alloyNS BEFORE creating stub
    // This tells the alloy.min.js IIFE which globals to wire up
    if (!window.__alloyNS) {
      window.__alloyNS = ['alloy'];
      console.log('[DEBUG] Set window.__alloyNS:', window.__alloyNS);
    }

    // Create queue stub
    window.alloy = window.alloy || function alloy(...args) {
      console.log('[DEBUG] Queue stub called, pushing to queue');
      (window.alloy.q = window.alloy.q || []).push(args);
    };
    window.alloy.q = window.alloy.q || [];
    console.log('[DEBUG] Queue stub created');

    // Inject the script
    const script = document.createElement('script');
    script.src = 'https://cdn1.adoberesources.net/alloy/2.20.0/alloy.min.js';
    script.async = true;

    script.addEventListener('load', () => {
      console.log('[DEBUG] Script load event fired');

      // Wait for the IIFE to replace the stub
      // Real alloy.q will be drained and deleted when the real SDK initializes
      let pollCount = 0;
      const check = setInterval(() => {
        pollCount += 1;
        const alloyExists = !!window.alloy;
        const alloyType = typeof window.alloy;
        const hasQ = window.alloy?.q !== undefined;

        console.log(`[DEBUG] Poll #${pollCount}: alloy exists=${alloyExists}, type=${alloyType}, has .q=${hasQ}`);

        // Real alloy: is a function AND .q is gone (stub drained the queue)
        if (alloyExists && alloyType === 'function' && !hasQ) {
          clearInterval(check);
          console.log('[DEBUG] Real alloy detected! Calling configure...');

          try {
            // Don't await this—alloy('configure') queues itself if not ready
            window.alloy('configure', {
              datastreamId: DATASTREAM_ID,
              orgId: ORG_ID,
              defaultConsent: 'in',
              renderDecisions: false,
            });

            console.log('[SUCCESS] configure() queued successfully');
            resolve();
          } catch (err) {
            console.error('[ERROR] configure() threw:', err);
            resolve(); // Still resolve to not block the page
          }
        }
      }, 100);

      // Timeout: give up after 5 seconds
      setTimeout(() => {
        clearInterval(check);
        console.warn('[WARNING] Timeout: alloy still not ready, giving up');
        console.warn('[WARNING] Current state: window.alloy.q =', window.alloy?.q);
        resolve(); // Resolve anyway so page doesn't hang
      }, 5000);
    });

    script.addEventListener('error', (err) => {
      console.error('[ERROR] Script load failed:', err);
      reject(new Error('[Alloy] Failed to load from CDN'));
    });

    document.head.appendChild(script);
    console.log('[DEBUG] Script tag added to head');
  });
}
