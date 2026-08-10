/**
 * Target integration using alloy.js Web SDK
 * Fetches personalization propositions from Target
 */

import loadAlloy from './alloy-setup.js';

let cachedPropositions = null;

/**
 * Fetch Target propositions for given scopes
 * @param {Array<string>} scopes - Decision scopes to request
 * @returns {Promise<Array>} Propositions from Target
 */
export async function getTargetPropositions(scopes = []) {
  console.log('[TARGET] getTargetPropositions called with scopes:', scopes);

  if (cachedPropositions) {
    console.log('[TARGET] Returning cached propositions');
    return cachedPropositions;
  }

  try {
    console.log('[TARGET] Loading alloy...');
    await loadAlloy();
  } catch (err) {
    console.error('[TARGET] Failed to load alloy:', err);
    return [];
  }

  if (typeof window.alloy !== 'function') {
    console.error('[TARGET] window.alloy is not available');
    return [];
  }

  try {
    console.log('[TARGET] Sending event to Target with scopes:', scopes);
    const result = await window.alloy('sendEvent', {
      renderDecisions: false,
      personalization: {
        decisionScopes: scopes,
      },
      xdm: {
        eventType: 'web.webpagedetails.pageViews',
        web: {
          webPageDetails: {
            name: document.title,
            URL: window.location.href,
          },
        },
      },
    });

    console.log('[TARGET] Response from Target:', result);

    cachedPropositions = result?.propositions || [];
    console.log('[TARGET] Cached propositions:', cachedPropositions);

    return cachedPropositions;
  } catch (err) {
    console.error('[TARGET] sendEvent failed:', err);
    return [];
  }
}

/**
 * Send display notification to Target
 * @param {Array} propositions - Propositions to track
 */
export function notifyDisplay(propositions) {
  console.log('[TARGET] notifyDisplay called');

  if (!propositions?.length) {
    console.log('[TARGET] No propositions to track');
    return;
  }

  try {
    window.alloy('sendEvent', {
      xdm: {
        eventType: '_experience.decisioning.propositionDisplay',
        _experience: {
          decisioning: {
            propositions,
          },
        },
      },
    });

    console.log('[TARGET] Display notification sent');
  } catch (err) {
    console.error('[TARGET] notifyDisplay error:', err);
  }
}

/**
 * Send click notification to Target
 * @param {Array} propositions - Propositions to track
 */
export function notifyClick(propositions) {
  console.log('[TARGET] notifyClick called');

  if (!propositions?.length) {
    console.log('[TARGET] No propositions to track');
    return;
  }

  try {
    window.alloy('sendEvent', {
      xdm: {
        eventType: '_experience.decisioning.propositionInteract',
        _experience: {
          decisioning: {
            propositions,
          },
        },
      },
    });

    console.log('[TARGET] Click notification sent');
  } catch (err) {
    console.error('[TARGET] notifyClick error:', err);
  }
}

/**
 * Clear cached propositions
 */
export function clearCache() {
  cachedPropositions = null;
  console.log('[TARGET] Cache cleared');
}
