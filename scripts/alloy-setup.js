const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg';

export default function loadAlloy() {
  console.log('[DEBUG] loadAlloy() called');

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.alloy && window.alloy.configured) {
      console.log('[DEBUG] alloy already configured, skipping');
      resolve();
      return;
    }

    console.log('[DEBUG] Starting alloy initialization...');

    // Step 1: Register instance name
    window.__alloyNS = window.__alloyNS || [];
    if (!window.__alloyNS.includes('alloy')) {
      window.__alloyNS.push('alloy');
      console.log('[DEBUG] Registered alloy in __alloyNS:', window.__alloyNS);
    }

    // Step 2: Create queue stub
    window.alloy = window.alloy || function alloy(...args) {
      console.log('[DEBUG] Queue stub called with args:', args);
      (window.alloy.q = window.alloy.q || []).push(args);
    };
    window.alloy.q = window.alloy.q || [];
    console.log('[DEBUG] Queue stub created, window.alloy.q:', window.alloy.q);

    // Step 3: Inject script tag
    const script = document.createElement('script');
    script.src = 'https://cdn1.adoberesources.net/alloy/2.20.0/alloy.min.js';
    script.async = true;

    console.log('[DEBUG] Created script tag, src:', script.src);

    script.addEventListener('load', () => {
      console.log('[DEBUG] Script load event fired');
      console.log('[DEBUG] window.alloy type:', typeof window.alloy);
      console.log('[DEBUG] window.alloy.q:', window.alloy?.q);

      // Wait for real alloy to replace stub
      const check = setInterval(() => {
        const alloyType = typeof window.alloy;
        const hasQ = !!window.alloy?.q;

        console.log('[DEBUG] Poll: alloy type =', alloyType, ', has .q =', hasQ);

        if (window.alloy && alloyType === 'function' && !hasQ) {
          console.log('[DEBUG] Real alloy detected! Configuring...');
          clearInterval(check);

          try {
            window.alloy('configure', {
              datastreamId: DATASTREAM_ID,
              orgId: ORG_ID,
              defaultConsent: 'in',
              renderDecisions: false,
            });
            console.log('[DEBUG] configure() call sent to alloy');
            window.alloy.configured = true;
            console.log('[SUCCESS] Alloy configured successfully!');
            resolve();
          } catch (err) {
            console.error('[ERROR] configure() failed:', err);
            resolve(); // Still resolve to not block the page
          }
        }
      }, 50);

      // Timeout fallback
      setTimeout(() => {
        clearInterval(check);
        console.warn('[DEBUG] Timeout waiting for alloy, resolving anyway');
        resolve();
      }, 3000);
    });

    script.addEventListener('error', (err) => {
      console.error('[ERROR] Script failed to load:', err);
      reject(new Error('[Alloy] Failed to load alloy.js'));
    });

    document.head.appendChild(script);
    console.log('[DEBUG] Script tag appended to head');
  });
}
