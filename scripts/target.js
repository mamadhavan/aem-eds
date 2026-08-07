/**
 * Fetch Target propositions directly from Edge Network API
 * No SDK needed — just direct HTTP calls
 */
export async function getTargetPropositions(scopes = []) {
  const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
  const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg';

  console.log('[DEBUG] getTargetPropositions called with scopes:', scopes);

  if (!scopes.length) {
    console.warn('[WARNING] No scopes provided');
    return [];
  }

  const url = `https://edge.adobedc.net/ee/v2/interact?datastreamId=${DATASTREAM_ID}`;

  const payload = {
    event: {
      xdm: {
        eventType: 'web.webpagedetails.pageViews',
        web: {
          webPageDetails: {
            name: document.title,
            URL: window.location.href,
          },
        },
        _experience: {
          decisioning: {
            propositionDisplay: {},
          },
        },
      },
    },
    query: {
      personalization: {
        decisionScopes: scopes,
      },
    },
  };

  console.log('[DEBUG] Sending request to Edge Network:', url);
  console.log('[DEBUG] Payload:', payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for ECID
      body: JSON.stringify(payload),
    });

    console.log('[DEBUG] Response status:', response.status);

    if (!response.ok) {
      console.error('[ERROR] Edge Network returned:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('[DEBUG] Full Edge Network response:', JSON.stringify(data, null, 2));

     // Log each item in the handle array
    if (data?.handle) {
      data.handle.forEach((item, index) => {
        console.log(`[DEBUG] Handle item ${index}:`, item);
      });
    }

    // Extract propositions from response
    const propositions = data?.handle?.reduce((acc, item) => {
      if (item.type === 'personalization:decisions') {
        acc.push(...(item.payload || []));
      }
      return acc;
    }, []) || [];

    console.log('[DEBUG] Extracted propositions:', propositions);
    return propositions;
  } catch (err) {
    console.error('[ERROR] Edge Network request failed:', err);
    return [];
  }
}

export function notifyDisplay(propositions) {
  console.log('[DEBUG] notifyDisplay called');

  if (!propositions?.length) {
    return;
  }

  const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
  const url = `https://edge.adobedc.net/ee/v2/interact?datastreamId=${DATASTREAM_ID}`;

  const payload = {
    event: {
      xdm: {
        eventType: '_experience.decisioning.propositionDisplay',
        _experience: {
          decisioning: {
            propositions,
          },
        },
      },
    },
  };

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  }).catch(err => console.error('[ERROR] notifyDisplay failed:', err));
}

export function notifyClick(propositions) {
  console.log('[DEBUG] notifyClick called');

  if (!propositions?.length) {
    return;
  }

  const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
  const url = `https://edge.adobedc.net/ee/v2/interact?datastreamId=${DATASTREAM_ID}`;

  const payload = {
    event: {
      xdm: {
        eventType: '_experience.decisioning.propositionInteract',
        _experience: {
          decisioning: {
            propositions,
          },
        },
      },
    },
  };

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  }).catch(err => console.error('[ERROR] notifyClick failed:', err));
}
