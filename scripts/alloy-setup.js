
const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853'; // Replace with your actual Datastream ID GUID

const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg';       // Replace with your actual Org ID

export function loadAlloy() {

  return new Promise((resolve) => {

    // If already loaded and configured, skip

    if (window.alloy) {

      resolve();

      return;

    }

    // Standard Adobe Alloy queue stub

    /* eslint-disable */

    !function(n,o){o in n||(n[o]=function(){n[o].q.push(arguments)},n[o].q=[])}(window,"alloy");

    /* eslint-enable */

    const script = document.createElement('script');

    script.src = 'https://cdn1.adoberesources.net/alloy/2.19.2/alloy.min.js';

    script.async = true;

    script.onload = () => {

      window.alloy('configure', {

        datastreamId: DATASTREAM_ID,

        orgId: ORG_ID,

        defaultConsent: 'in',

        renderDecisions: false,

      });

      resolve();

    };

    script.onerror = (err) => {

      console.error('[Alloy] Script load error:', err);

      resolve();

    };

    document.head.appendChild(script);

  });

}

