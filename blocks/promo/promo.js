import { getTargetPropositions, notifyDisplay, notifyClick } from '../../scripts/target.js';

export default async function decorate(block) {
  console.log('[DEBUG] promo.js decorate() called');
  console.log('[DEBUG] block element:', block);

  const rows = [...block.children];
  console.log('[DEBUG] block rows:', rows);

  const configRow = rows[0];
  const fallbackRow = rows[1];

  const decisionScope = configRow?.textContent?.trim();
  console.log('[DEBUG] Decision scope from config:', decisionScope);

  if (configRow) configRow.remove();

  if (!decisionScope) {
    console.warn('[WARNING] No decision scope configured, showing fallback');
    return;
  }

  if (fallbackRow) {
    fallbackRow.style.opacity = '1';
    console.log('[DEBUG] Fallback row made visible');
  }

  try {
    console.log('[DEBUG] Fetching Target propositions...');
    const propositions = await getTargetPropositions([decisionScope]);
    console.log('[DEBUG] Got propositions:', propositions);

    const matchedProposition = propositions.find((p) => p.scope === decisionScope);
    console.log('[DEBUG] Matched proposition:', matchedProposition);

    if (!matchedProposition || !matchedProposition.items?.length) {
      console.warn('[WARNING] No matching proposition found');
      return;
    }

    const contentItem = matchedProposition.items[0].data?.content;
    console.log('[DEBUG] Content item from Target:', contentItem);

    if (!contentItem) {
      console.warn('[WARNING] No content in proposition');
      return;
    }

    const { headline, subheading, body, ctaLabel, ctaUrl, imageUrl } = contentItem;
    console.log('[DEBUG] Parsed content:', { headline, subheading, body, ctaLabel, ctaUrl, imageUrl });

    // Clear and render
    block.innerHTML = `
      <div class="promo-personalized">
        ${imageUrl ? `<img src="${imageUrl}" alt="Promo" />` : ''}
        ${headline ? `<h2>${headline}</h2>` : ''}
        ${subheading ? `<h3>${subheading}</h3>` : ''}
        ${body ? `<p>${body}</p>` : ''}
        ${ctaUrl ? `<a href="${ctaUrl}" class="button">${ctaLabel || 'Learn More'}</a>` : ''}
      </div>
    `;
    console.log('[DEBUG] DOM updated with Target content');

    // Track display
    notifyDisplay([matchedProposition]);

    // Track clicks
    if (ctaUrl) {
      const ctaElement = block.querySelector('a.button');
      ctaElement?.addEventListener('click', () => {
        console.log('[DEBUG] CTA clicked');
        notifyClick([matchedProposition]);
      });
      console.log('[DEBUG] Click listener attached to CTA');
    }
  } catch (err) {
    console.error('[ERROR] Failed to fetch Target propositions:', err);
  }
}
