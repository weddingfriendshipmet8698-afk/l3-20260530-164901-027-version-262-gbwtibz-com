(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  if (slides.length > 1) {
    var currentSlide = 0;
    var showSlide = function (index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === currentSlide);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentSlide);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var cardList = qs('[data-card-list]');
  if (cardList) {
    var cards = qsa('.movie-card', cardList);
    var searchInput = qs('[data-card-search]');
    var yearFilter = qs('[data-year-filter]');
    var typeFilter = qs('[data-type-filter]');
    var filterCards = function () {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearFilter && yearFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category')
        ].join(' '));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchType));
      });
    };
    [searchInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  var rankingList = qs('[data-ranking-list]');
  if (rankingList) {
    var rankingRows = qsa('.ranking-row', rankingList);
    var rankingSearch = qs('[data-ranking-search]');
    var rankingType = qs('[data-ranking-type]');
    var filterRanking = function () {
      var keyword = normalize(rankingSearch && rankingSearch.value);
      var type = normalize(rankingType && rankingType.value);
      rankingRows.forEach(function (row) {
        var text = normalize(row.textContent);
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !type || text.indexOf(type) !== -1;
        row.classList.toggle('hidden-row', !(matchKeyword && matchType));
      });
    };
    [rankingSearch, rankingType].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterRanking);
        control.addEventListener('change', filterRanking);
      }
    });
  }

  qsa('[data-video-player]').forEach(function (player) {
    var video = qs('video', player);
    var button = qs('[data-play-button]', player);
    var source = player.getAttribute('data-video-source');
    var started = false;

    var startVideo = function () {
      if (!video || !source) {
        return;
      }
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else {
          video.src = source;
        }
        started = true;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
      player.classList.add('playing');
    };

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startVideo();
      });
    }
    player.addEventListener('click', function (event) {
      if (event.target !== video) {
        startVideo();
      }
    });
  });

  var searchData = window.SEARCH_MOVIES || [];
  var searchForm = qs('[data-search-form]');
  var searchInput = qs('[data-search-input]');
  var searchResults = qs('[data-search-results]');
  var searchStatus = qs('[data-search-status]');

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function renderSearch(query) {
    if (!searchResults || !searchStatus) {
      return;
    }
    var keyword = normalize(query);
    if (!keyword) {
      searchResults.innerHTML = '';
      searchStatus.textContent = '输入关键词后查看结果。';
      return;
    }
    var matches = searchData.filter(function (movie) {
      return normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.tags
      ].join(' ')).indexOf(keyword) !== -1;
    }).slice(0, 120);
    searchStatus.textContent = matches.length ? '已找到相关影片：' + matches.length + ' 条' : '没有找到匹配影片。';
    searchResults.innerHTML = matches.map(function (movie) {
      var title = escapeHtml(movie.title);
      var category = escapeHtml(movie.category);
      var type = escapeHtml(movie.type);
      var region = escapeHtml(movie.region);
      var oneLine = escapeHtml(movie.oneLine);
      var url = escapeHtml(movie.url);
      var cover = escapeHtml(movie.cover);
      var year = escapeHtml(movie.year);
      var rating = escapeHtml(movie.rating);
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + url + '">',
        '    <img src="./' + cover + '.jpg" alt="' + title + '" loading="lazy">',
        '    <span class="poster-year">' + year + '</span>',
        '    <span class="poster-rating">' + rating + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><span>' + category + '</span><span>' + type + '</span><span>' + region + '</span></div>',
        '    <h3><a href="' + url + '">' + title + '</a></h3>',
        '    <p>' + oneLine + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  if (searchForm && searchInput) {
    var initialQuery = getQueryValue();
    searchInput.value = initialQuery;
    renderSearch(initialQuery);
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState({}, '', url);
      renderSearch(query);
    });
  }
})();
