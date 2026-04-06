async function searchSite(query) {
  // EDS automatically generates this index at the root
  const resp = await fetch('/query-index.json');
  const json = await resp.json();
  return json.data.filter((post) => {
    const text = `${post.title} ${post.description}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });
}

export default function decorate(block) {
  block.innerHTML = `
    <div class="search-container">
      <input type="text" placeholder="Search the site..." class="search-input">
      <ul class="search-results"></ul>
    </div>
  `;

  const input = block.querySelector('.search-input');
  const resultsContainer = block.querySelector('.search-results');

  input.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length < 3) {
      resultsContainer.innerHTML = '';
      return;
    }

    const results = await searchSite(query);
    resultsContainer.innerHTML = results
      .map((res) => `<li><a href="${res.path}">${res.title}</a></li>`)
      .join('');
  });
}
