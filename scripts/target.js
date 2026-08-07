import loadAlloy from './alloy-setup.js';

let cachedPropositions = null;

/**
 * Fetch personalization propositions from Target via Edge Network.
 * @param {Array<string>} scopes - Decision scope names (e.g., ['hero-banner'])
 * @returns {Promise<Array>} Array of proposition objects
 */
export async function getTargetPropositions(scopes = []) {
  if (cachedPropositions) {
    return cachedPropositions;
  }

  // Ensure alloy is loaded and configured
  try {
    await loadAlloy();
  } catch (e) {
    console.error('Failed to load alloy:', e);
    return [];
  }

  if (typeof window.alloy !== 'function') {
    console.error('[Target] window.alloy is not available');
    return [];
  }

  try {
    // Send event to Edge Network, requesting personalization for given scopes
    const result = await window.alloy('sendEvent', {
      renderDecisions: false, // We render manually in blocks
      personalization: {
        decisionScopes: scopes, // e.g., ['hero-banner']
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

    // Extract propositions from response
    cachedPropositions = result?.propositions || [];
    return cachedPropositions;
  } catch (err) {
    console.error('[Target] sendEvent failed:', err);
    return [];
  }
}

/**
 * Notify Target that a proposition was displayed (impression tracking).
 * @param {Array} propositions - The proposition objects that were rendered
 */
export function notifyDisplay(propositions) {
  if (!propositions?.length) {
    return;
  }

  window.alloy('sendEvent', {
    xdm: {
      eventType: '_experience.decisioning.propositionDisplay',
      _experience: {
        decisioning: { propositions },
      },
    },
  });
}

/**
 * Notify Target that a user interacted with (clicked) an offer.
 * @param {Array} propositions - The proposition objects that were clicked
 */
export function notifyClick(propositions) {
  if (!propositions?.length) {
    return;
  }

  window.alloy('sendEvent', {
    xdm: {
      eventType: '_experience.decisioning.propositionInteract',
      _experience: {
        decisioning: { propositions },
      },
    },
  });
}
