const DATASTREAM_ID = '3f75f0f0-4f07-482b-930a-8ef876cf2853';
const ORG_ID = 'E71EADC8584130D00A495EBD@AdobeOrg';

export function loadAlloy() {
  return new Promise((resolve) => {
    if (window.alloy) {
      resolve();
      return;
    }

    !function(n,o){o in n||(n[o]=function(){n[o].q.push(arguments)},n[o].q=[])}(window,'alloy');

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
    document.head.appendChild(script);
  });
}