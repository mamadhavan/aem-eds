import { loadAlloy } from './alloy-setup.js';
 
let cachedPropositions = null;
 
export async function getTargetPropositions(scopes = []) {

  if (cachedPropositions) return cachedPropositions;
 
  await loadAlloy();
 
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

    data: {

      __adobe: {

        target: {

          userType: window.localStorage.getItem('userType') || 'anonymous',

        },

      },

    },

  });
 
  cachedPropositions = result?.propositions || [];

  return cachedPropositions;

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