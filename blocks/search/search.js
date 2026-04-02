export default async function decorate(block) {
  // Helper to create HTML elements
  const html = (tag, attrs = {}, content = '') => {
    const attrString = Object.keys(attrs)
      .map((key) => ' ' + key + '="' + attrs[key] + '"')
      .join('');
    return '<' + tag + attrString + '>' + content + '</' + tag + '>';
  };

  // Create UI
  block.innerHTML =
    html('div', { class: 'search-box' },
      html('input', { type: 'text', placeholder: 'Search...' }) +
      html('div', { class: 'suggestions' }) +
      html('div', { class: 'results' })
    );

  const input = block.querySelector('input');
  const suggestionsEl = block.querySelector('.suggestions');
  const resultsEl = block.querySelector('.results');

  // Fetch index
  const resp = await fetch('/query-index.json');
  const data = await resp.json();

  // Suggestion logic
  const handleInput = () => {
    const query = input.value.toLowerCase();

    if (!query) {
      suggestionsEl.innerHTML = '';
      return;
    }

    const matches = data
      .filter((page) => page.title && page.title.toLowerCase().includes(query))
      .slice(0, 5);

    suggestionsEl.innerHTML = matches
      .map((p) => html('div', { class: 'suggestion-item', 'data-path': p.path }, p.title))
      .join('');
  };

  input.addEventListener('input', handleInput);

  // Click on suggestion
  const handleSuggestionClick = (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      window.location.href = item.dataset.path;
    }
  };

  suggestionsEl.addEventListener('click', handleSuggestionClick);

  // Full search on Enter
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      const query = input.value.toLowerCase();

      const results = data.filter(
        (page) =>
          (page.title && page.title.toLowerCase().includes(query)) ||
          (page.description && page.description.toLowerCase().includes(query))
      );

      resultsEl.innerHTML = results
        .map(
          (p) =>
            html('div', { class: 'result' },
              html('a', { href: p.path },
                html('h3', {}, p.title) +
                html('p', {}, p.description || '')
              )
            )
        )
        .join('');
    }
  };

  input.addEventListener('keydown', handleEnter);
}