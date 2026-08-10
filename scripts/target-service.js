/**
 * Target Service
 * Complete integration with alloy.js
 *
 * Usage:
 * import { getTargetContent, trackDisplay, trackInteraction } from './target-service.js';
 *
 * const result = await getTargetContent('my-scope');
 * if (result) {
 *   const { content, proposition } = result;
 *   // Use content...
 *   await trackDisplay(proposition);
 * }
 */

import loadAlloy from './alloy-setup.js';

// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════

/**
 * Generate unique page view ID
 */
function generatePageViewId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get connection type
 */
function getConnectionType() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return connection?.effectiveType || 'unknown';
}

// ════════════════════════════════════════════════════════════
// CACHE MANAGEMENT
// ════════════════════════════════════════════════════════════

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache entry with timestamp
 */
class CacheEntry {
  constructor(data) {
    this.data = data;
    this.timestamp = Date.now();
  }

  isExpired() {
    return Date.now() - this.timestamp > CACHE_TTL;
  }
}

// ════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ════════════════════════════════════════════════════════════

/**
 * Get Target content for a decision scope
 * @param {string} scope - Decision scope name
 * @returns {Promise<{content, proposition} | null>}
 */
export async function getTargetContent(scope) {
  console.log('[TARGET-SERVICE] getTargetContent:', scope);

  if (!scope) {
    console.warn('[TARGET-SERVICE] No scope provided');
    return null;
  }

  try {
    // Check cache
    const cached = cache.get(scope);
    if (cached && !cached.isExpired()) {
      console.log('[TARGET-SERVICE] Returning cached content');
      return cached.data;
    }

    if (cached && cached.isExpired()) {
      console.log('[TARGET-SERVICE] Cache expired, removing');
      cache.delete(scope);
    }

    // Load alloy
    console.log('[TARGET-SERVICE] Ensuring alloy is loaded...');
    await loadAlloy();
    console.log('[TARGET-SERVICE] Alloy ready');

    // Check alloy is available
    if (!window.alloy || typeof window.alloy !== 'function') {
      console.error('[TARGET-SERVICE] Alloy not available');
      return null;
    }

    // Send event to Target
    console.log('[TARGET-SERVICE] Sending event to Target...');

    const response = await window.alloy('sendEvent', {
      renderDecisions: false,
      personalization: {
        decisionScopes: [scope],
      },
      xdm: {
        eventType: 'web.webpagedetails.pageViews',
        web: {
          webPageDetails: {
            name: document.title || 'Unknown Page',
            URL: window.location.href,
            pageViewID: generatePageViewId(),
          },
          webReferrer: {
            URL: document.referrer || '',
          },
        },
        environment: {
          browserDetails: {
            userAgent: navigator.userAgent,
            acceptLanguage: navigator.language,
          },
          connectionType: getConnectionType(),
        },
        timestamp: new Date().toISOString(),
      },
    });

    console.log('[TARGET-SERVICE] Response received:', response);

    // Extract propositions
    const propositions = response?.propositions || [];

    if (!propositions.length) {
      console.warn('[TARGET-SERVICE] No propositions in response');
      return null;
    }

    const proposition = propositions.find((p) => p.scope === scope);

    if (!proposition) {
      console.warn('[TARGET-SERVICE] No proposition found for scope:', scope);
      return null;
    }

    if (!proposition.items?.length) {
      console.warn('[TARGET-SERVICE] Proposition has no items');
      return null;
    }

    const content = proposition.items[0].data?.content;

    if (!content) {
      console.warn('[TARGET-SERVICE] No content in proposition');
      return null;
    }

    console.log('[TARGET-SERVICE] Content extracted:', content);

    // Cache result
    const result = { content, proposition };
    cache.set(scope, new CacheEntry(result));
    console.log('[TARGET-SERVICE] Content cached');

    return result;
  } catch (err) {
    console.error('[TARGET-SERVICE] Error:', err);
    return null;
  }
}

/**
 * Track display (impression)
 * @param {Object} proposition - Proposition from getTargetContent
 */
export async function trackDisplay(proposition) {
  console.log('[TARGET-SERVICE] trackDisplay');

  if (!proposition) {
    console.warn('[TARGET-SERVICE] No proposition for display tracking');
    return;
  }

  try {
    await window.alloy('sendEvent', {
      xdm: {
        eventType: '_experience.decisioning.propositionDisplay',
        _experience: {
          decisioning: {
            propositions: [proposition],
          },
        },
        timestamp: new Date().toISOString(),
      },
    });

    console.log('[TARGET-SERVICE] Display tracked');
  } catch (err) {
    console.error('[TARGET-SERVICE] Display tracking failed:', err);
  }
}

/**
 * Track interaction (click/conversion)
 * @param {Object} proposition - Proposition from getTargetContent
 */
export async function trackInteraction(proposition) {
  console.log('[TARGET-SERVICE] trackInteraction');

  if (!proposition) {
    console.warn('[TARGET-SERVICE] No proposition for interaction tracking');
    return;
  }

  try {
    await window.alloy('sendEvent', {
      xdm: {
        eventType: '_experience.decisioning.propositionInteract',
        _experience: {
          decisioning: {
            propositions: [proposition],
          },
        },
        timestamp: new Date().toISOString(),
      },
    });

    console.log('[TARGET-SERVICE] Interaction tracked');
  } catch (err) {
    console.error('[TARGET-SERVICE] Interaction tracking failed:', err);
  }
}

/**
 * Get multiple scopes at once
 * @param {Array<string>} scopes - Array of scope names
 * @returns {Promise<Object>} Map of scope -> content
 */
export async function getTargetContents(scopes = []) {
  console.log('[TARGET-SERVICE] getTargetContents:', scopes);

  const results = {};

  for (const scope of scopes) {
    // eslint-disable-next-line no-await-in-loop
    const result = await getTargetContent(scope);
    results[scope] = result;
  }

  return results;
}

/**
 * Clear cache
 */
export function clearCache() {
  console.log('[TARGET-SERVICE] Clearing cache');
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const stats = {
    size: cache.size,
    keys: Array.from(cache.keys()),
    entries: {},
  };

  cache.forEach((entry, key) => {
    stats.entries[key] = {
      expired: entry.isExpired(),
      age: Date.now() - entry.timestamp,
    };
  });

  return stats;
}
