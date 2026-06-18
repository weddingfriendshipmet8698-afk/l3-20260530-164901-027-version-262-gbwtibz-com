(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    var target = document.querySelector(input.getAttribute('data-local-filter'));
    if (!target) {
      return;
    }
    var items = Array.prototype.slice.call(target.querySelectorAll('[data-filter-item]'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = (item.getAttribute('data-filter-text') || item.textContent).toLowerCase();
        item.style.display = text.indexOf(keyword) > -1 ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    }, { once: true });
  });

  function attachPlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var stream = root.getAttribute('data-stream');
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function start() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = stream;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    root.querySelectorAll('[data-play]').forEach(function (button) {
      button.addEventListener('click', start);
    });
  }

  document.querySelectorAll('.movie-player').forEach(attachPlayer);

  function cardHtml(item) {
    var safeTitle = escapeHtml(item.title);
    var safeMeta = escapeHtml([item.year, item.region, item.type].filter(Boolean).join(' · '));
    var safeText = escapeHtml(item.one_line || item.genre || '');
    var safeGenre = escapeHtml(item.genre || '精选影片');
    return [
      '<article class="card" data-filter-item data-filter-text="' + escapeAttr(item.title + ' ' + item.genre + ' ' + item.tags + ' ' + item.region + ' ' + item.year) + '">',
      '  <a class="poster" href="' + escapeAttr(item.file) + '">',
      '    <img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy" decoding="async">',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="movie-meta"><span class="badge">' + safeMeta + '</span></div>',
      '    <h2 class="movie-title"><a href="' + escapeAttr(item.file) + '">' + safeTitle + '</a></h2>',
      '    <p class="movie-text clamp-2">' + safeText + '</p>',
      '    <div class="tag-row" style="margin-top:12px"><span class="pill">' + safeGenre + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
  }

  var searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && window.MOVIES_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var heading = document.querySelector('[data-search-heading]');
    var input = document.querySelector('[data-search-page-input]');
    if (input) {
      input.value = q;
    }
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.MOVIES_INDEX.filter(function (item) {
      if (!terms.length) {
        return true;
      }
      var haystack = [item.title, item.genre, item.tags, item.region, item.year, item.one_line].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) > -1;
      });
    }).slice(0, 120);
    if (heading) {
      heading.textContent = q ? '搜索：' + q : '片库搜索';
    }
    searchRoot.innerHTML = results.length ? results.map(cardHtml).join('') : '<div class="empty-state">没有找到匹配内容，可以尝试更换关键词。</div>';
  }
})();
