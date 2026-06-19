(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initBackTop() {
    document.querySelectorAll("[data-back-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
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

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search']");
        var query = input ? input.value.trim() : "";
        var target = "./library.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) {
      return;
    }
    var searchInput = document.querySelector(".movie-search-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && searchInput) {
      searchInput.value = query;
    }

    function selected(key) {
      var select = document.querySelector(".filter-select[data-filter-key='" + key + "']");
      return select ? normalize(select.value) : "";
    }

    function apply() {
      var words = normalize(searchInput ? searchInput.value : "").split(/\s+/).filter(Boolean);
      var year = selected("year");
      var region = selected("region");
      var category = selected("category");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var okText = words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
        var okYear = !year || normalize(card.getAttribute("data-year")) === year;
        var okRegion = !region || normalize(card.getAttribute("data-region")) === region;
        var okCategory = !category || normalize(card.getAttribute("data-category")) === category;
        card.classList.toggle("is-hidden", !(okText && okYear && okRegion && okCategory));
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (block) {
      var video = block.querySelector("video");
      var button = block.querySelector("[data-play-button]");
      var initialized = false;
      var hls = null;

      if (!video || !button) {
        return;
      }

      function attach() {
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;
        var url = video.getAttribute("data-video-url");
        if (!url) {
          return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          return Promise.resolve();
        }
        video.src = url;
        return Promise.resolve();
      }

      function play() {
        block.classList.add("is-loading");
        attach().then(function () {
          return video.play();
        }).then(function () {
          block.classList.add("is-playing");
          block.classList.remove("is-loading");
        }).catch(function () {
          block.classList.remove("is-loading");
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        block.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          block.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        block.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initBackTop();
    initHero();
    initGlobalSearch();
    initFilters();
    initPlayers();
  });
})();
