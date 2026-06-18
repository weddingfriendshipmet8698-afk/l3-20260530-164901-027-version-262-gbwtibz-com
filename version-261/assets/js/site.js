(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupForms();
    setupHero();
    setupFilters();
    setupPlayer();
  });

  function setupImages() {
    document.querySelectorAll('[data-image-fallback]').forEach(function (image) {
      image.addEventListener('error', function () {
        var parent = image.parentElement;
        if (parent) {
          parent.classList.add('poster-missing');
        }
        image.remove();
      }, { once: true });
    });
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupForms() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = next;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var bars = document.querySelectorAll('[data-filter-bar]');
    bars.forEach(function (bar) {
      var scope = bar.parentElement || document;
      var list = scope.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
      var keywordInput = bar.querySelector('[data-local-filter]');
      var regionSelect = bar.querySelector('[data-filter-region]');
      var yearSelect = bar.querySelector('[data-filter-year]');
      var empty = scope.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');
      if (!cards.length) {
        return;
      }

      function apply() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var cardRegion = card.getAttribute('data-region') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [keywordInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial && keywordInput) {
        keywordInput.value = initial;
      }
      apply();
    });
  }

  function setupPlayer() {
    var player = document.getElementById('movie-player');
    var trigger = document.querySelector('.play-trigger');
    if (!player || !trigger) {
      return;
    }
    var stream = trigger.getAttribute('data-stream-url') || player.getAttribute('data-stream-url');
    var hlsInstance = null;

    function attachStream() {
      if (!stream) {
        return;
      }
      if (player.getAttribute('data-ready') === 'true') {
        return;
      }
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = stream;
        player.setAttribute('data-ready', 'true');
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(player);
        player.setAttribute('data-ready', 'true');
        return;
      }
      player.src = stream;
      player.setAttribute('data-ready', 'true');
    }

    function play() {
      attachStream();
      trigger.classList.add('is-playing');
      var promise = player.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          trigger.classList.remove('is-playing');
        });
      }
    }

    trigger.addEventListener('click', play);
    player.addEventListener('click', function () {
      if (!player.getAttribute('data-ready')) {
        play();
      }
    });
    player.addEventListener('play', function () {
      trigger.classList.add('is-playing');
    });
    player.addEventListener('pause', function () {
      if (player.currentTime === 0 || player.ended) {
        trigger.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
