let cachedPropositions = null;

/**
 * Sends a request to Adobe Edge Network (Adobe Target) for personalization propositions.
 * @param {Array<string>} scopes Array of decision scopes (e.g. ['personalized-text'])
 * @returns {Promise<Array>} Array of propositions returned by Target
 */
export async function getTargetPropositions(scopes = []) {
  if (cachedPropositions) {
    return cachedPropositions;
  }

  // Ensure window.alloy is available (configured in scripts.js)
  if (typeof window.alloy !== 'function') {
    console.error('[Target] window.alloy is not available');
    return [];
  }

  try {
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

    cachedPropositions = result?.propositions || [];
    return cachedPropositions;
  } catch (err) {
    console.error('[Target] sendEvent failed:', err);
    return [];
  }
}

/**
 * Notifies Adobe Target that an offer was displayed (required for impression reporting).
 * @param {Array} propositions Array of proposition objects that were rendered
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
 * Notifies Adobe Target that a user interacted with/clicked an offer (for conversion goals).
 * @param {Array} propositions Array of proposition objects that were clicked
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
