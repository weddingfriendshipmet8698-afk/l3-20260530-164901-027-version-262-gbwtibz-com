(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var data = window.MOVIE_SEARCH_DATA || [];
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-search-category]");
    var results = document.querySelector("[data-search-results]");
    var info = document.querySelector("[data-search-info]");

    if (!form || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join("");

      return [
        '<article class="movie-card">',
        '  <a class="poster-wrap" href="' + movie.url + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="badge poster-badge">' + escapeHtml(movie.year) + '</span>',
        '    <span class="badge score-badge">' + escapeHtml(movie.score) + '</span>',
        '  </a>',
        '  <div class="movie-body">',
        '    <h2 class="movie-title line-2"><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
        '    <p class="card-desc line-2">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join("\n");
    }

    function runSearch() {
      var query = normalize(input.value);
      var selectedCategory = category ? category.value : "";

      var matched = data.filter(function (movie) {
        var matchQuery = !query || normalize(movie.search).indexOf(query) !== -1;
        var matchCategory = !selectedCategory || movie.categorySlug === selectedCategory;
        return matchQuery && matchCategory;
      }).slice(0, 120);

      results.innerHTML = matched.map(card).join("\n");
      if (info) {
        info.textContent = matched.length ? "已显示 " + matched.length + " 条匹配结果" : "没有找到匹配影片";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });

    input.addEventListener("input", runSearch);
    if (category) {
      category.addEventListener("change", runSearch);
    }

    runSearch();
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
