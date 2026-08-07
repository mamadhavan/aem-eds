import loadAlloy from './alloy-setup.js';

let cachedPropositions = null;

export async function getTargetPropositions(scopes = []) {
  console.log('[DEBUG] getTargetPropositions called with scopes:', scopes);

  if (cachedPropositions) {
    console.log('[DEBUG] Returning cached propositions:', cachedPropositions);
    return cachedPropositions;
  }

  console.log('[DEBUG] Loading alloy...');
  try {
    await loadAlloy();
    console.log('[DEBUG] Alloy loaded successfully');
  } catch (e) {
    console.error('[ERROR] Failed to load alloy:', e);
    return [];
  }

  if (typeof window.alloy !== 'function') {
    console.error('[ERROR] window.alloy is not a function. Type:', typeof window.alloy);
    return [];
  }

  console.log('[DEBUG] Calling window.alloy(sendEvent)...');

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

    console.log('[DEBUG] sendEvent response:', result);
    cachedPropositions = result?.propositions || [];
    console.log('[SUCCESS] Got propositions:', cachedPropositions);
    return cachedPropositions;
  } catch (err) {
    console.error('[ERROR] sendEvent failed:', err);
    return [];
  }
}

export function notifyDisplay(propositions) {
  console.log('[DEBUG] notifyDisplay called with propositions:', propositions);

  if (!propositions?.length) {
    console.log('[DEBUG] No propositions to display');
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

  console.log('[DEBUG] Display notification sent');
}

export function notifyClick(propositions) {
  console.log('[DEBUG] notifyClick called with propositions:', propositions);

  if (!propositions?.length) {
    console.log('[DEBUG] No propositions to click');
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

  console.log('[DEBUG] Click notification sent');
}
