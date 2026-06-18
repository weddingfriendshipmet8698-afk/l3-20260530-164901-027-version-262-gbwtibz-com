(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var message = document.querySelector("[data-player-message]");
    var source = video ? video.getAttribute("data-src") : "";
    var hlsInstance = null;
    var initialized = false;

    if (!video || !button || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function attachSource() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setMessage("已调用浏览器原生 HLS 播放能力。");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放连接暂时不可用，请刷新页面后重试。");
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            initialized = false;
          }
        });
        setMessage("已初始化 HLS 播放器，点击画面可暂停或继续。");
        return;
      }

      video.src = source;
      setMessage("当前浏览器不支持 HLS.js，已尝试直接加载播放源。");
    }

    function startPlayback() {
      attachSource();
      player.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setMessage("浏览器拦截了自动播放，请再次点击播放按钮或视频画面。");
          player.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }
})();
