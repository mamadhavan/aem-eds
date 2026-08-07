import { notifyDisplay, notifyClick } from '../../scripts/target.js';

export default async function decorate(block) {
  const propositions = window.targetPropositions || [];
  const prop = propositions.find((p) => p.scope === 'promo-card-scope');
  const offer = prop?.items?.[0]?.data?.content;

  if (!offer) {
    return;
  }

  const {
    headline, subtext, ctaLabel, ctaUrl,
  } = offer;

  const h2 = block.querySelector('h2, h3');
  const p = block.querySelector('p');
  const cta = block.querySelector('.button, a');

  if (h2 && headline) h2.textContent = headline;
  if (p && subtext) p.textContent = subtext;

  if (cta && ctaLabel) {
    cta.textContent = ctaLabel;
    cta.href = ctaUrl || '#';
    cta.addEventListener('click', () => notifyClick([prop]));
  }

  notifyDisplay([prop]);
}
