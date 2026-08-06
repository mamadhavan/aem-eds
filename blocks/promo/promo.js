// blocks/promo-card/promo-card.js
import { notifyDisplay, notifyClick } from '../../scripts/target.js';

export default async function decorate(block) {
  // 1. Read cached propositions from global window object
  const propositions = window.targetPropositions || [];

  // 2. Find the proposition matching this block's scope name
  const prop  = propositions.find(p => p.scope === 'promo-card-scope');
  const offer = prop?.items?.[0]?.data?.content;

  // 3. Fallback: If no Target offer returned, keep default AEM content
  if (!offer) {
    console.warn('[Promo Card] No Target offer found — rendering default content');
    return;
  }

  // 4. Extract fields directly from the Target JSON offer
  const { headline, subtext, ctaLabel, ctaUrl } = offer;

  // 5. Query existing EDS block elements and update the DOM
  const h2  = block.querySelector('h2, h3');
  const p   = block.querySelector('p');
  const cta = block.querySelector('.button, a');

  if (h2 && headline) h2.textContent = headline;
  if (p && subtext)   p.textContent  = subtext;
  if (cta && ctaLabel) {
    cta.textContent = ctaLabel;
    cta.href        = ctaUrl || '#';

    // Track click conversion in Target when user clicks the CTA
    cta.addEventListener('click', () => notifyClick([prop]));
  }

  // 6. Notify Target that the offer was successfully displayed (required for reporting)
  notifyDisplay([prop]);
}