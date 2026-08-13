mport { notifyDisplay } from '../../scripts/target.js';

const AEM_API_BASE = 'https://your-aem-headless-host';

async function fetchContentFragment(cfReference) {
  const response = await fetch(`${AEM_API_BASE}/fragments/${cfReference}.json`);
  if (!response.ok) return null;
  return response.json();
}

export default async function decorate(block) {
  const propositions = window.targetPropositions || [];
  const proposition = propositions.find((p) => p.scope === 'personalized-text');
  const offer = proposition?.items?.[0]?.data?.content;

  if (!offer?.cfReference) return;

  const cf = await fetchContentFragment(offer.cfReference);
  if (!cf) return;

  const headline = block.querySelector('h2');
  const body = block.querySelector('p');
  const cta = block.querySelector('a');

  if (headline) headline.textContent = cf.headline;
  if (body) body.textContent = cf.bodyText;
  if (cta) {
    cta.textContent = cf.ctaLabel;
    cta.href = cf.ctaUrl;
  }

  notifyDisplay([proposition]);
}