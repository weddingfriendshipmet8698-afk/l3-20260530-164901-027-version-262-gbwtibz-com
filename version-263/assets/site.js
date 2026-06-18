(function () {
  const body = document.body;
  const menuButton = document.querySelector("[data-menu-button]");
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      body.classList.toggle("menu-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let currentSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function resetTimer() {
    if (timer) {
      clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = setInterval(nextSlide, 5600);
    }
  }

  const previousButton = document.querySelector("[data-hero-prev]");
  const nextButton = document.querySelector("[data-hero-next]");
  if (previousButton) {
    previousButton.addEventListener("click", function () {
      showSlide(currentSlide - 1);
      resetTimer();
    });
  }
  if (nextButton) {
    nextButton.addEventListener("click", function () {
      nextSlide();
      resetTimer();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const index = Number(dot.getAttribute("data-hero-dot"));
      showSlide(index);
      resetTimer();
    });
  });
  resetTimer();

  const filterInput = document.querySelector("[data-filter-input]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const typeFilter = document.querySelector("[data-type-filter]");
  const filterList = document.querySelector("[data-filter-list]");

  function applyFilters() {
    if (!filterList) {
      return;
    }
    const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    const year = yearFilter ? yearFilter.value : "";
    const type = typeFilter ? typeFilter.value : "";
    const cards = Array.from(filterList.querySelectorAll("[data-card]"));
    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
      const matchesQuery = !query || haystack.indexOf(query) !== -1;
      const matchesYear = !year || card.getAttribute("data-year") === year;
      const matchesType = !type || card.getAttribute("data-type") === type;
      card.classList.toggle("is-hidden", !(matchesQuery && matchesYear && matchesType));
    });
  }

  [filterInput, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  const autoSearch = document.querySelector("[data-autofocus-search]");
  if (autoSearch) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      autoSearch.value = query;
      applyFilters();
    }
  }
}());
