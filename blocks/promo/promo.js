import { getTargetPropositions, notifyDisplay, notifyClick } from '../../scripts/target.js';

export default async function decorate(block) {
  console.log('[DEBUG] promo.js decorate() called');

  // HARDCODE SCOPE FOR TESTING (will remove once parsing works)
  const decisionScope = 'personalized-text';
  console.log('[DEBUG] Using hardcoded scope:', decisionScope);

  try {
    console.log('[DEBUG] Fetching Target propositions...');
    const propositions = await getTargetPropositions([decisionScope]);
    console.log('[DEBUG] Got propositions:', propositions);

    if (!propositions?.length) {
      console.warn('[WARNING] No propositions returned');
      return;
    }

    const matched = propositions.find((p) => p.scope === decisionScope);
    console.log('[DEBUG] Matched proposition:', matched);

    if (!matched?.items?.length) {
      console.warn('[WARNING] No items in matched proposition');
      return;
    }

    const contentItem = matched.items[0].data?.content;
    console.log('[DEBUG] Content item:', contentItem);

    if (!contentItem) {
      console.warn('[WARNING] No content in item');
      return;
    }

    const { headline, body, ctaLabel, ctaUrl } = contentItem;
    console.log('[DEBUG] Parsed:', { headline, body, ctaLabel, ctaUrl });

    // Render
    block.innerHTML = `
      <div class="promo-personalized">
        ${headline ? `<h2>${headline}</h2>` : ''}
        ${body ? `<p>${body}</p>` : ''}
        ${ctaUrl ? `<a href="${ctaUrl}" class="button">${ctaLabel || 'Learn More'}</a>` : ''}
      </div>
    `;
    console.log('[DEBUG] Block rendered');

    notifyDisplay([matched]);

    if (ctaUrl) {
      block.querySelector('a')?.addEventListener('click', () => {
        notifyClick([matched]);
      });
    }
  } catch (err) {
    console.error('[ERROR] Block decoration failed:', err);
  }
}
