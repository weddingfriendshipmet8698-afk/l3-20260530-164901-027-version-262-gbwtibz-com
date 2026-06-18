(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function cardMatches(card, keyword, type, year) {
        var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type")
        ].join(" "));
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var typeOk = !type || cardType === type;
        var yearOk = true;
        if (year) {
            if (year === "classic") {
                yearOk = !/^202[1-6]$/.test(cardYear);
            } else {
                yearOk = cardYear === year;
            }
        }
        return keywordOk && typeOk && yearOk;
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-root]").forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var type = root.querySelector("[data-filter-type]");
            var year = root.querySelector("[data-filter-year]");
            var scope = root.parentElement || document;
            var list = scope.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
            var empty = scope.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = cardMatches(card, keyword, typeValue, yearValue);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, type, year].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            });
            apply();
        });
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        var list = document.querySelector("[data-search-list]");
        if (!input || !list) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");

        function apply() {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var ok = cardMatches(card, keyword, "", "");
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        input.addEventListener("input", apply);
        apply();
    }

    function setupPlayer() {
        var root = document.querySelector("[data-player]");
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        var stream = root.getAttribute("data-stream");
        var loaded = false;
        var hls = null;
        if (!video || !overlay || !stream) {
            return;
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function attachAndPlay() {
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }
            video.src = stream;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
        }

        function start() {
            overlay.classList.add("is-hidden");
            attachAndPlay();
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayer();
    });
})();
