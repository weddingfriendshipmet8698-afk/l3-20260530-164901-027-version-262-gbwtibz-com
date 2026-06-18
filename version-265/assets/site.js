(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function setupMenu() {
        all('[data-menu-toggle]').forEach(function (button) {
            var panel = one(button.getAttribute('data-menu-toggle'));
            if (!panel) {
                return;
            }
            button.addEventListener('click', function () {
                panel.classList.toggle('open');
            });
        });
    }

    function setupHero() {
        var hero = one('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = one('[data-hero-prev]', hero);
        var next = one('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
                slide.classList.toggle('opacity-100', i === index);
                slide.classList.toggle('opacity-0', i !== index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        all('[data-filter-scope]').forEach(function (scope) {
            var input = one('[data-search-input]', scope);
            var cards = all('[data-card]', scope);
            var buttons = all('[data-filter-value]', scope);
            var empty = one('[data-no-results]', scope);
            var active = 'all';

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var tagText = [
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || ''
                    ].join(' ').toLowerCase();
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedTag = active === 'all' || tagText.indexOf(active.toLowerCase()) !== -1;
                    var matched = matchedQuery && matchedTag;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    active = button.getAttribute('data-filter-value') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });
            if (input) {
                input.addEventListener('input', apply);
            }
            apply();
        });
    }

    window.initPlayer = function (video, overlay, streamUrl) {
        if (!video || !streamUrl) {
            return;
        }
        var ready = false;

        function prepare() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                ready = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video._h = hls;
                ready = true;
                return;
            }
            video.src = streamUrl;
            ready = true;
        }

        function playNow() {
            prepare();
            video.controls = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playNow);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playNow();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
