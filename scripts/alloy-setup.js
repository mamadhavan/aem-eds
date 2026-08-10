/**
 * Adobe Web SDK (alloy.js) Configuration
 * Complete setup with error handling and configuration
 */

// ════════════════════════════════════════════════════════════
// CONFIGURATION - UPDATE WITH YOUR VALUES
// ════════════════════════════════════════════════════════════

const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg';
const ALLOY_VERSION = '2.20.0';

// ════════════════════════════════════════════════════════════

let alloyInitPromise = null;

/**
 * Initialize alloy.js Web SDK
 * Can be called multiple times, will only initialize once
 */
export default function loadAlloy() {
  console.log('[ALLOY] loadAlloy() called');

  // Return existing promise if already loading
  if (alloyInitPromise) {
    console.log('[ALLOY] Already initializing, returning existing promise');
    return alloyInitPromise;
  }

  alloyInitPromise = new Promise((resolve, reject) => {
    try {
      // Check if already configured
      if (window.alloy && typeof window.alloy === 'function' && window.alloy.configured) {
        console.log('[ALLOY] Already configured');
        resolve();
        return;
      }

      console.log('[ALLOY] Starting initialization');

      // STEP 1: Set up namespace
      // eslint-disable-next-line no-underscore-dangle
      window.__alloyNS = window.__alloyNS || [];
      // eslint-disable-next-line no-underscore-dangle
      if (!window.__alloyNS.includes('alloy')) {
        // eslint-disable-next-line no-underscore-dangle
        window.__alloyNS.push('alloy');
        console.log('[ALLOY] Namespace registered');
      }

      // STEP 2: Create queue stub
      window.alloy = window.alloy || function alloy(...args) {
        console.log('[ALLOY] Queue stub called with args:', args[0]);
        (window.alloy.q = window.alloy.q || []).push(args);
      };

      window.alloy.q = window.alloy.q || [];
      console.log('[ALLOY] Queue stub created');

      // STEP 3: Inject alloy script from CDN
      const script = document.createElement('script');
      script.src = `https://cdn1.adoberesources.net/alloy/${ALLOY_VERSION}/alloy.min.js`;
      script.async = true;

      console.log('[ALLOY] Script URL:', script.src);

      // STEP 4: Handle script load
      script.addEventListener('load', () => {
        console.log('[ALLOY] Script loaded from CDN');

        // Wait for real alloy to be ready
        let pollAttempts = 0;
        const maxAttempts = 100; // 10 seconds (100 * 100ms)

        const pollInterval = setInterval(() => {
          pollAttempts += 1;

          const alloyType = typeof window.alloy;
          const hasQueue = !!window.alloy?.q;

          console.log(`[ALLOY] Poll ${pollAttempts}: type=${alloyType}, hasQueue=${hasQueue}`);

          // Real alloy is loaded when it's a function AND queue is gone
          if (alloyType === 'function' && !hasQueue) {
            clearInterval(pollInterval);
            console.log('[ALLOY] Real alloy detected!');

            // STEP 5: Configure alloy
            try {
              console.log('[ALLOY] Configuring with datastream:', DATASTREAM_ID);

              window.alloy('configure', {
                datastreamId: DATASTREAM_ID,
                orgId: ORG_ID,
                defaultConsent: 'in',
                renderDecisions: false,
                debugEnabled: false,
                edgeConfigOverrides: {
                  com_adobe_experience_platform: {
                    datasets: {
                      event: {
                        datasetId: 'YOUR_EVENT_DATASET_ID', // Optional
                      },
                    },
                  },
                },
              });

              window.alloy.configured = true;
              console.log('[SUCCESS] ✅ Alloy configured successfully');

              resolve();
            } catch (err) {
              console.error('[ERROR] Configuration failed:', err);
              reject(err);
            }
          }

          // Timeout
          if (pollAttempts >= maxAttempts) {
            clearInterval(pollInterval);
            console.error('[ERROR] Alloy initialization timeout (10 seconds)');
            console.error('[ERROR] Current state:', {
              alloyType,
              hasQueue,
              windowAlloy: window.alloy,
            });
            reject(new Error('Alloy initialization timeout'));
          }
        }, 100);
      });

      // STEP 6: Handle script load error
      script.addEventListener('error', (err) => {
        console.error('[ERROR] Script load failed:', err);
        reject(new Error('Failed to load alloy.js from CDN'));
      });

      // STEP 7: Append script to head
      document.head.appendChild(script);
      console.log('[ALLOY] Script appended to head');
    } catch (err) {
      console.error('[ERROR] Unexpected error in loadAlloy:', err);
      reject(err);
    }
  });

  return alloyInitPromise;
}

/**
 * Clear initialization state (for testing)
 */
export function resetAlloy() {
  console.log('[ALLOY] Resetting alloy state');
  alloyInitPromise = null;
  window.alloy = null;
  // eslint-disable-next-line no-underscore-dangle
  window.__alloyNS = [];
}

/**
 * Get alloy configuration
 */
export function getAlloyConfig() {
  return {
    datastreamId: DATASTREAM_ID,
    orgId: ORG_ID,
    version: ALLOY_VERSION,
    isConfigured: window.alloy?.configured || false,
  };
}
