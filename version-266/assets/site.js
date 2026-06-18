(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalFilter();
    setupSearchRedirects();
  });

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length <= 1) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  function setupLocalFilter() {
    var filterInput = document.querySelector("[data-local-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    if (!cards.length || (!filterInput && !yearSelect)) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(filterInput ? filterInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || cardYear === year;
        var shouldShow = matchKeyword && matchYear;

        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
  }

  function setupSearchRedirects() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }

        event.preventDefault();
        window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }
})();
