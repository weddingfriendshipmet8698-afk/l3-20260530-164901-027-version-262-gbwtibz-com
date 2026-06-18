(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            button.setAttribute('aria-expanded', String(open));
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var list = qs('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = qsa('[data-movie-card]', list);
        var search = qs('[data-filter-search]');
        var region = qs('[data-filter-region]');
        var type = qs('[data-filter-type]');
        var category = qs('[data-filter-category]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (search && initialQuery) {
            search.value = initialQuery;
        }

        function apply() {
            var query = normalize(search && search.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var categoryValue = normalize(category && category.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category')
                ].join(' '));
                var keep = true;
                if (query && haystack.indexOf(query) === -1) {
                    keep = false;
                }
                if (regionValue && normalize(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
                    keep = false;
                }
                if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
                    keep = false;
                }
                if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
                    keep = false;
                }
                card.classList.toggle('is-hidden', !keep);
            });
        }

        [search, region, type, category].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
        apply();
    }

    function initPlayer(options) {
        var video = qs('#movie-video');
        var trigger = qs('#play-trigger');
        if (!video || !trigger || !options || !options.stream) {
            return;
        }
        var started = false;
        var hls = null;

        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function start() {
            trigger.classList.add('is-hidden');
            if (!started) {
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(options.stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, play);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = options.stream;
                    play();
                } else {
                    video.src = options.stream;
                    play();
                }
            } else {
                play();
            }
        }

        trigger.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
