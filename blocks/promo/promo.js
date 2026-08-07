import { getTargetPropositions, notifyDisplay, notifyClick } from '../../scripts/target.js';

export default async function decorate(block) {
  // Parse the authored config from the first row
  const rows = [...block.children];
  const configRow = rows[0];
  const fallbackRow = rows[1];

  // Extract decision scope from first cell of config row
  const decisionScope = configRow?.textContent?.trim();

  // Remove the config row from DOM (it's metadata, not content)
  if (configRow) configRow.remove();

  // If no scope configured, just leave fallback visible
  if (!decisionScope) {
    return;
  }

  // Show fallback immediately (good for LCP, no layout shift)
  if (fallbackRow) {
    fallbackRow.style.opacity = '1';
  }

  try {
    // Fetch Target propositions for this scope
    const propositions = await getTargetPropositions([decisionScope]);

    // Find the proposition matching this scope
    const matchedProposition = propositions.find((p) => p.scope === decisionScope);

    if (!matchedProposition || !matchedProposition.items?.length) {
      // No personalization content; fallback stays visible
      return;
    }

    const contentItem = matchedProposition.items[0].data?.content;

    if (!contentItem) {
      return;
    }

    // Extract fields from Target's JSON response
    const { headline, subheading, body, ctaLabel, ctaUrl, imageUrl } = contentItem;

    // Clear fallback and render personalized content
    block.innerHTML = `
      <div class="promo-personalized">
        ${imageUrl ? `<img src="${imageUrl}" alt="Promo" />` : ''}
        ${headline ? `<h2>${headline}</h2>` : ''}
        ${subheading ? `<h3>${subheading}</h3>` : ''}
        ${body ? `<p>${body}</p>` : ''}
        ${ctaUrl ? `<a href="${ctaUrl}" class="button">${ctaLabel || 'Learn More'}</a>` : ''}
      </div>
    `;

    // Notify Target that we displayed this proposition (impression tracking)
    notifyDisplay([matchedProposition]);

    // Track clicks if there's a CTA
    if (ctaUrl) {
      const ctaElement = block.querySelector('a.button');
      ctaElement?.addEventListener('click', () => {
        notifyClick([matchedProposition]);
      });
    }
  } catch (err) {
    console.error('Failed to fetch Target propositions:', err);
    // Fallback content stays visible if something goes wrong
  }
}
