export default async function decorate(block) {
  // Build basic search UI
  block.innerHTML = '<div class="search-box">'
    + '<input type="text" placeholder="Search...">'
    + '<div class="suggestions"></div>'
    + '<div class="results"></div>'
    + '</div>';

  const input = block.querySelector('input');
  const suggestionsEl = block.querySelector('.suggestions');
  const resultsEl = block.querySelector('.results');

  // Load search data
  const resp = await fetch('/query-index.json');
  const data = await resp.json();

  // Show suggestions
  const showSuggestions = () => {
    const query = input.value.toLowerCase();
    if (!query) {
      suggestionsEl.innerHTML = '';
      return;
    }

    const matches = data.filter(function(page) {
      return page.title && page.title.toLowerCase().includes(query);
    }).slice(0, 5);

    suggestionsEl.innerHTML = matches.map(function(p) {
      return '<div class="suggestion-item" data-path="' + p.path + '">' + p.title + '</div>';
    }).join('');
  };

  input.addEventListener('input', showSuggestions);

  // Click on suggestion
  const clickSuggestion = function(e) {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      window.location.href = item.dataset.path;
    }
  };
  suggestionsEl.addEventListener('click', clickSuggestion);

  // Search on Enter
  const searchEnter = function(e) {
    if (e.key === 'Enter') {
      const query = input.value.toLowerCase();
      const results = data.filter(function(page) {
        return (page.title && page.title.toLowerCase().includes(query)) ||
               (page.description && page.description.toLowerCase().includes(query));
      });

      resultsEl.innerHTML = results.map(function(p) {
        return '<div class="result">'
          + '<a href="' + p.path + '">'
          + '<h3>' + p.title + '</h3>'
          + '<p>' + (p.description || '') + '</p>'
          + '</a>'
          + '</div>';
      }).join('');
    }
  };
  input.addEventListener('keydown', searchEnter);
}