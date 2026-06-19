function initPlayer(videoId, buttonId, overlayId, playlistUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hlsInstance = null;

    function load() {
        if (!video || loaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playlistUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(playlistUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = playlistUrl;
        }

        loaded = true;
    }

    function play() {
        if (!video) {
            return;
        }

        load();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", play);
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }
}
