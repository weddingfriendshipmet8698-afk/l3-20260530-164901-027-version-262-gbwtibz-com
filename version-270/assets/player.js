(function () {
  var scriptUrl = document.currentScript ? document.currentScript.src : '';
  var hlsUrl = scriptUrl ? new URL('hls-vendor-dru42stk.js', scriptUrl).href : 'assets/hls-vendor-dru42stk.js';
  var players = Array.prototype.slice.call(document.querySelectorAll('.player-box'));

  function nativeHls(video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  }

  function loadWithHls(video, stream) {
    return import(hlsUrl).then(function (mod) {
      var Hls = mod.H || mod.default;
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({enableWorker: true, lowLatencyMode: true});
        hls.loadSource(stream);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          setTimeout(resolve, 1200);
        });
      }
      video.src = stream;
      return Promise.resolve();
    }).catch(function () {
      video.src = stream;
    });
  }

  function prepare(video) {
    if (video.dataset.ready === '1') return Promise.resolve();
    var stream = video.getAttribute('data-stream');
    video.dataset.ready = '1';
    if (nativeHls(video)) {
      video.src = stream;
      return Promise.resolve();
    }
    return loadWithHls(video, stream);
  }

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    if (!video || !cover) return;
    function start() {
      cover.classList.add('is-hidden');
      prepare(video).then(function () {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            cover.classList.remove('is-hidden');
          });
        }
      });
    }
    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) start();
    });
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
  });
})();
