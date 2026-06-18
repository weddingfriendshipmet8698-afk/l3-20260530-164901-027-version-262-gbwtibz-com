(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  var prev = document.querySelector('.hero-arrow.prev');
  var next = document.querySelector('.hero-arrow.next');
  if (prev) prev.addEventListener('click', function () { showSlide(current - 1); });
  if (next) next.addEventListener('click', function () { showSlide(current + 1); });
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-go')) || 0);
    });
  });
  if (slides.length > 1) {
    setInterval(function () { showSlide(current + 1); }, 5000);
  }

  var keywordInput = document.querySelector('.page-filter');
  var yearFilter = document.querySelector('.year-filter');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-target .movie-card'));
  function applyFilter() {
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    filterCards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.category, card.dataset.year].join(' ').toLowerCase();
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !year || card.dataset.year === year;
      card.style.display = matchedKeyword && matchedYear ? '' : 'none';
    });
  }
  if (keywordInput) keywordInput.addEventListener('input', applyFilter);
  if (yearFilter) yearFilter.addEventListener('change', applyFilter);

  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var searchStatus = document.getElementById('searchStatus');
  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char];
    });
  }
  function resultCard(item) {
    return '<article class="movie-card compact">' +
      '<a href="' + escapeHtml(item.url) + '">' +
      '<figure class="poster-wrap"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="play-chip">播放</span></figure>' +
      '<div class="card-content"><div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
      '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.desc) + '</p><div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div></div>' +
      '</a></article>';
  }
  function runSearch() {
    if (!searchInput || !searchResults || !window.SITE_SEARCH) return;
    var query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    if (!query) {
      if (searchStatus) searchStatus.textContent = '输入关键词后查看相关影片。';
      return;
    }
    var words = query.split(/\s+/).filter(Boolean);
    var matched = window.SITE_SEARCH.filter(function (item) {
      var haystack = [item.title, item.region, item.year, item.genre, item.tags, item.category, item.desc].join(' ').toLowerCase();
      return words.every(function (word) { return haystack.indexOf(word) !== -1; });
    }).slice(0, 120);
    if (searchStatus) searchStatus.textContent = matched.length ? '为你匹配到相关影片。' : '没有找到匹配影片。';
    searchResults.innerHTML = matched.map(resultCard).join('');
  }
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchInput.value = q;
    searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  document.querySelectorAll('[data-rank-tab]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('[data-rank-tab]').forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
    });
  });
})();
