import loadAlloy from './alloy-setup.js';

let cachedPropositions = null;

export async function getTargetPropositions(scopes = []) {
  console.error('Step 1', scopes);
  if (cachedPropositions) {
    console.error('Step 2');
    return cachedPropositions;
  }

  try {
    console.error('Step 3');
    await loadAlloy();
    console.error('Step 4');
  } catch (e) {
    console.error('Step 5');
    console.error('Target alloy failed', e);
  }

  if (typeof window.alloy !== 'function') {
    console.error('[Target] window.alloy is not available after loadAlloy()');
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

export function notifyDisplay(propositions) {
  if (!propositions?.length) return;

  window.alloy('sendEvent', {
    xdm: {
      eventType: '_experience.decisioning.propositionDisplay',
      _experience: {
        decisioning: { propositions },
      },
    },
  });
}

export function notifyClick(propositions) {
  if (!propositions?.length) return;

  window.alloy('sendEvent', {
    xdm: {
      eventType: '_experience.decisioning.propositionInteract',
      _experience: {
        decisioning: { propositions },
      },
    },
  });
}
