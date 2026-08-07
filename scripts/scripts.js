import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  loadScript,
} from './aem.js';
import initSidekickActions from './sidekick-actions.js';
import initDamArchive from './sidekick-action1.js';
import { getTargetPropositions } from './target.js';

/**
 * Moves all the attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads and configures Adobe Web SDK (alloy.js).
 * Uses EDS loadScript to handle nonce-based CSP automatically.
 */
async function configureAlloy() {
  // Step 1: Register the instance name and define the queue stub.
  // alloy.min.js reads window.__alloyNS to know which stub(s) to wire up.
  window.__alloyNS = window.__alloyNS || [];
  if (!window.__alloyNS.includes('alloy')) {
    window.__alloyNS.push('alloy');
  }

  window.alloy = window.alloy || function alloy(...args) {
    (window.alloy.q = window.alloy.q || []).push(args);
  };
  window.alloy.q = window.alloy.q || [];

  // Step 2: Inject the script if not already present
  await new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="alloy.min.js"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `${window.hlx.codeBasePath}/scripts/alloy.min.js`;

    script.addEventListener('load', () => {
      resolve();
    });

    script.addEventListener('error', () => {
      reject(new Error('[Alloy] script failed to load'));
    });

    document.head.appendChild(script);
  });

  // Step 3: Wait for the real alloy to replace the stub (its .q is drained/removed)
  await new Promise((resolve) => {
    const check = setInterval(() => {
      if (window.alloy && !window.alloy.q) {
        clearInterval(check);
        resolve();
      }
    }, 50);

    setTimeout(() => {
      clearInterval(check);
      console.warn('[Alloy] timeout — alloy.q still exists:', window.alloy?.q);
      resolve();
    }, 3000);
  });

  if (typeof window.alloy !== 'function') {
    console.error('[Alloy] alloy still not a function after load');
    return;
  }

  try {
    await window.alloy('configure', {
      datastreamId: '3f75f0f0-4f07-482b-930a-8ef876cf2853',
      orgId: 'E71EADC8584130D00A495EBD@AdobeOrg',
      defaultConsent: 'in',
      renderDecisions: false,
    });
  } catch (err) {
    console.error('[Alloy] configure failed:', err);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  // Step 1: Load and configure alloy first via EDS loadScript
  try {
    await configureAlloy();
  } catch (e) {
    console.error('[Alloy] configureAlloy failed:', e);
  }

  // Step 2: Fetch Target propositions after alloy is ready
  try {
    window.targetPropositions = await getTargetPropositions(['personalized-text']);
  } catch (e) {
    console.error('[Target] failed to load propositions:', e);
    window.targetPropositions = [];
  }

  // Step 3: Decorate and render page normally
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  initSidekickActions();
  initDamArchive();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
