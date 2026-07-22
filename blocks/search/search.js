async function searchPosts(query) {
  // Fetch both index files in parallel
  const [res1, res2] = await Promise.all([
    fetch('/query-index.json'),
    fetch('/free-text.json')
  ]);

  // Parse JSON bodies
  const [json1, json2] = await Promise.all([
    res1.json(),
    res2.json()
  ]);

  // Combine data arrays from both index endpoints
  const combinedData = [
    ...(json1.data || []),
    ...(json2.data || [])
  ];

  const lowerQuery = query.toLowerCase();

  return combinedData.filter((post) => {
    // Safely combine fields using optional chaining / fallback to empty string
    const title = post.title || '';
    const description = post.description || '';
    const introParagraph = post.introParagraph || '';
    const pageHeading = post.pageHeading || '';
    const content = post.content || '';

    const text = `${title} ${description} ${introParagraph} ${pageHeading} ${content}`.toLowerCase();

    return text.includes(lowerQuery);
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
