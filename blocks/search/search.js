import { createOptimizedPicture } from '../../scripts/aem.js';

function getScore(item, query) {
  let score = 0;
  const title = item.title?.toLowerCase() || '';
  const desc = item.description?.toLowerCase() || '';
  const priority = parseInt(item.priority, 10) || 1;

  if (title === query) score += 100; // Exact title match
  else if (title.startsWith(query)) score += 50; // Starts with
  else if (title.includes(query)) score += 20; // Contains

  if (desc.includes(query)) score += 5; // Matches description

  return score * priority; // Apply manual AEM boosting
}

function renderResults(results, container) {
  container.innerHTML = results.length > 0
    ? results.map((item) => `
      <div class="search-result-card">
        <div class="search-result-image">${createOptimizedPicture(item.image, item.title, false, [{ width: '300' }]).outerHTML}</div>
        <div class="search-result-content">
          <h3><a href="${item.path}">${item.title}</a></h3>
          <p>${item.description}</p>
        </div>
      </div>`).join('')
    : '<p class="no-results">No matches found.</p>';
}

export default async function decorate(block) {
  block.innerHTML = `
    <div class="search-wrapper">
      <div class="search-input-group">
        <input type="text" id="search-input" placeholder="Search..." autocomplete="off">
        <ul id="search-suggestions" class="suggestions-list"></ul>
      </div>
      <div id="search-results"></div>
    </div>`;

  const input = block.querySelector('#search-input');
  const suggestions = block.querySelector('#search-suggestions');
  const resultsDiv = block.querySelector('#search-results');

  // Fetch index (cached at the edge)
  const resp = await fetch('/query-index.json');
  const json = await resp.json();
  const { data } = json;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    if (query.length < 2) {
      suggestions.classList.remove('visible');
      resultsDiv.innerHTML = '';
      return;
    }

    const scored = data
      .map((item) => ({ ...item, score: getScore(item, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Render Autocomplete Suggestions (Top 5)
    suggestions.innerHTML = scored.slice(0, 5).map((s) => `<li>${s.title}</li>`).join('');
    suggestions.classList.toggle('visible', scored.length > 0);

    // Handle suggestion click
    suggestions.querySelectorAll('li').forEach((li, i) => {
      li.onclick = () => {
        input.value = li.textContent;
        suggestions.classList.remove('visible');
        renderResults([scored[i]], resultsDiv);
      };
    });

    // Render Main Results
    renderResults(scored, resultsDiv);
  });

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) suggestions.classList.remove('visible');
  });
}
