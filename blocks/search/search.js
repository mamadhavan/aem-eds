export default async function decorate(block) {
  // Create UI
  block.innerHTML =
    '<div class="search-box">' +
      '<input type="text" placeholder="Search..." />' +
      '<div class="suggestions"></div>' +
      '<div class="results"></div>' +
    '</div>';

  var input = block.querySelector('input');
  var suggestionsEl = block.querySelector('.suggestions');
  var resultsEl = block.querySelector('.results');

  var data = [];

  // ✅ Fetch index safely
  try {
    var resp = await fetch('/query-index.json');
    var json = await resp.json();

    // Handle both formats: [] or { data: [] }
    if (Array.isArray(json)) {
      data = json;
    } else if (json && Array.isArray(json.data)) {
      data = json.data;
    } else {
      data = [];
    }
  } catch (e) {
    console.error('Error loading query index:', e);
    return;
  }

  // 🔹 Autocomplete suggestions
  input.addEventListener('input', function () {
    var query = input.value.toLowerCase();

    if (!query) {
      suggestionsEl.innerHTML = '';
      return;
    }

    var matches = data.filter(function (page) {
      var title = page.title || '';
      return title.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 5);

    var html = '';
    for (var i = 0; i < matches.length; i++) {
      var p = matches[i];
      html +=
        '<div class="suggestion-item" data-path="' + (p.path || '#') + '">' +
        (p.title || 'No title') +
        '</div>';
    }

    suggestionsEl.innerHTML = html;
  });

  // 🔹 Click suggestion
  suggestionsEl.addEventListener('click', function (e) {
    var item = e.target.closest('.suggestion-item');
    if (item && item.getAttribute('data-path')) {
      window.location.href = item.getAttribute('data-path');
    }
  });

  // 🔹 Full search on Enter
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var query = input.value.toLowerCase();

      var results = data.filter(function (page) {
        var title = page.title || '';
        var desc = page.description || '';

        return (
          title.toLowerCase().indexOf(query) !== -1 ||
          desc.toLowerCase().indexOf(query) !== -1
        );
      });

      var html = '';
      for (var i = 0; i < results.length; i++) {
        var p = results[i];

        html +=
          '<div class="result">' +
            '<a href="' + (p.path || '#') + '">' +
              '<h3>' + (p.title || 'No title') + '</h3>' +
              '<p>' + (p.description || '') + '</p>' +
            '</a>' +
          '</div>';
      }

      resultsEl.innerHTML = html;
    }
  });
}
