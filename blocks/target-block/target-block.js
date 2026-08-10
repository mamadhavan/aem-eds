/**
 * Generic Target Block
 * Configurable block that renders Target content
 *
 * Configuration:
 * Row 1: Decision Scope (e.g., "hero-banner")
 * Row 2: (optional) Content type for special rendering
 */

import { getTargetContent, trackDisplay, trackInteraction } from '../../scripts/target-service.js';

/**
 * Render content from Target response
 */
function renderContent(content) {
  if (!content) return '';

  // Sanitize content
  const sanitize = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const {
    headline,
    subheading,
    description,
    ctaLabel,
    ctaUrl,
    backgroundColor,
    textColor,
    buttonColor,
    imageUrl,
    iconUrl,
  } = content;

  let html = `
    <div class="target-block-content" style="
      ${backgroundColor ? `background-color: ${backgroundColor};` : ''}
      ${textColor ? `color: ${textColor};` : ''}
    ">
  `;

  // Image section
  if (imageUrl) {
    html += `
      <div class="target-block-image">
        <img src="${sanitize(imageUrl)}" alt="${sanitize(headline) || 'Content'}" loading="lazy" />
      </div>
    `;
  }

  // Text content
  html += '<div class="target-block-text">';

  if (iconUrl) {
    html += `<div class="target-block-icon"><img src="${sanitize(iconUrl)}" alt="" /></div>`;
  }

  if (subheading) {
    html += `<span class="target-block-subheading">${sanitize(subheading)}</span>`;
  }

  if (headline) {
    html += `<h2 class="target-block-headline">${sanitize(headline)}</h2>`;
  }

  if (description) {
    html += `<p class="target-block-description">${sanitize(description)}</p>`;
  }

  if (ctaUrl && ctaLabel) {
    html += `
      <a href="${sanitize(ctaUrl)}" class="target-block-button"
         data-target-cta
         style="${buttonColor ? `background-color: ${buttonColor};` : ''}">
        ${sanitize(ctaLabel)}
      </a>
    `;
  }

  html += '</div></div>';

  return html;
}

export default async function decorate(block) {
  console.log('[TARGET-BLOCK] Decorating');

  try {
    // Get configuration from authored block
    const rows = [...block.children];
    const scope = rows[0]?.textContent?.trim();

    console.log('[TARGET-BLOCK] Scope:', scope);

    if (!scope) {
      console.warn('[TARGET-BLOCK] No scope configured');
      block.innerHTML = '';
      return;
    }

    // Remove config rows from DOM
    rows.forEach((row) => {
      row.remove();
    });

    // Show loading state
    block.classList.add('target-block-loading');
    block.innerHTML = '<div class="target-block-spinner">Loading personalized content...</div>';

    // Fetch Target content
    console.log('[TARGET-BLOCK] Fetching content for scope:', scope);
    const result = await getTargetContent(scope);

    block.classList.remove('target-block-loading');

    if (!result) {
      console.warn('[TARGET-BLOCK] No content from Target');
      block.innerHTML = '';
      return;
    }

    const { content, proposition } = result;

    console.log('[TARGET-BLOCK] Content received:', content);

    // Render content
    const html = renderContent(content);
    block.innerHTML = html;
    block.classList.add('target-block-rendered');

    console.log('[TARGET-BLOCK] Content rendered');

    // Send display notification
    await trackDisplay(proposition);

    // Add interaction tracking
    const cta = block.querySelector('[data-target-cta]');
    if (cta) {
      cta.addEventListener('click', async () => {
        console.log('[TARGET-BLOCK] CTA clicked');
        await trackInteraction(proposition);
      });
    }

    console.log('[TARGET-BLOCK] ✅ Complete');
  } catch (err) {
    console.error('[TARGET-BLOCK] Error:', err);
    block.innerHTML = '';
  }
}
