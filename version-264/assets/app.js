(function () {
  var hlsLoader = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    show(0);
    play();
  }

  function initLocalFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]"));
    sections.forEach(function (section) {
      var input = section.querySelector("[data-filter-search]");
      var type = section.querySelector("[data-filter-type]");
      var region = section.querySelector("[data-filter-region]");
      var empty = section.querySelector("[data-filter-empty]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));

      function apply() {
        var query = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
          var matchesRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
          var matched = matchesQuery && matchesType && matchesRegion;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function getSearchData() {
    try {
      if (typeof SEARCH_DATA !== "undefined" && Array.isArray(SEARCH_DATA)) {
        return SEARCH_DATA;
      }
    } catch (error) {
      return [];
    }
    return [];
  }

  function initGlobalSearch() {
    var data = getSearchData();
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    boxes.forEach(function (box) {
      var input = box.querySelector("[data-global-search]");
      var panel = box.querySelector("[data-global-search-panel]");
      if (!input || !panel) {
        return;
      }

      function close() {
        panel.classList.remove("is-open");
      }

      function render(items, query) {
        if (!query) {
          panel.innerHTML = "";
          close();
          return;
        }
        if (!items.length) {
          panel.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
          panel.classList.add("is-open");
          return;
        }
        panel.innerHTML = items.slice(0, 8).map(function (item) {
          return '<a class="search-item" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '">' +
            '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.type + ' · ' + item.year + '</span><span>' + item.oneLine + '</span></span>' +
            '</a>';
        }).join("");
        panel.classList.add("is-open");
      }

      input.addEventListener("input", function () {
        var query = normalize(input.value);
        var terms = query.split(/\s+/).filter(Boolean);
        var matches = data.filter(function (item) {
          var text = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" "));
          return terms.every(function (term) {
            return text.indexOf(term) !== -1;
          });
        });
        render(matches, query);
      });

      input.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          input.value = "";
          close();
        }
      });
    });

    document.addEventListener("click", function (event) {
      boxes.forEach(function (box) {
        if (!box.contains(event.target)) {
          var panel = box.querySelector("[data-global-search-panel]");
          if (panel) {
            panel.classList.remove("is-open");
          }
        }
      });
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("hls"));
      };
      document.head.appendChild(script);
    });
    return hlsLoader;
  }

  function setupPlayer(shell, url) {
    var video = shell.querySelector("video");
    var trigger = shell.querySelector("[data-play-trigger]");
    var errorBox = shell.querySelector("[data-player-error]");
    var initialized = false;
    var pending = false;
    var hls = null;

    if (!video || !url) {
      return;
    }

    function showError() {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = "播放暂时不可用，请稍后重试。";
      }
    }

    function hideError() {
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = "";
      }
    }

    function attach() {
      if (initialized) {
        return Promise.resolve();
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        initialized = true;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          return new Promise(function (resolve, reject) {
            var settled = false;
            hls = new Hls({
              enableWorker: true,
              maxBufferLength: 30
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              if (!settled) {
                settled = true;
                initialized = true;
                resolve();
              }
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal && !settled) {
                settled = true;
                reject(new Error("media"));
              }
            });
            window.setTimeout(function () {
              if (!settled) {
                settled = true;
                initialized = true;
                resolve();
              }
            }, 1200);
          });
        }
        video.src = url;
        initialized = true;
        return Promise.resolve();
      });
    }

    function play() {
      if (pending) {
        return;
      }
      pending = true;
      hideError();
      attach()
        .then(function () {
          video.controls = true;
          return video.play();
        })
        .then(function () {
          shell.classList.add("is-playing");
        })
        .catch(function () {
          showError();
        })
        .finally(function () {
          pending = false;
        });
    }

    if (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  window.ClassicMovie = {
    startPlayer: function (config) {
      ready(function () {
        var shell = document.querySelector(config.selector);
        if (shell) {
          setupPlayer(shell, config.url);
        }
      });
    }
  };

  ready(function () {
    initMobileNav();
    initHero();
    initLocalFilters();
    initGlobalSearch();
  });
})();
