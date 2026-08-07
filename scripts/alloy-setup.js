const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853'; // Replace with your actual Datastream ID GUID
const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg'; // Replace with your actual Org ID

export default function loadAlloy() {
  return new Promise((resolve, reject) => {
    if (window.alloy && window.alloy.configured) {
      resolve();
      return;
    }

    // Fresh queue stub
    window.alloy = function alloy(...args) {
      (window.alloy.q = window.alloy.q || []).push(args);
    };
    window.alloy.q = [];

    const script = document.createElement('script');
    script.src = 'https://cdn1.adoberesources.net/alloy/2.20.0/alloy.min.js';
    script.async = true;

    script.onload = async () => {
      try {
        // AWAIT configure — critical step
        await window.alloy('configure', {
          datastreamId: DATASTREAM_ID,
          orgId: ORG_ID,
          defaultConsent: 'in',
          renderDecisions: false,
        });

        // Mark as configured so we don't reconfigure on next call
        window.alloy.configured = true;
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });
}
