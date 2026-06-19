(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMobileMenu() {
    var toggle = one("[data-mobile-toggle]");
    var nav = one("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    var carousel = one("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = all("[data-hero-slide]", carousel);
    var dots = all("[data-hero-dot]", carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    all("[data-filter-scope]").forEach(function (scope) {
      var input = one("[data-search-input]", scope);
      var chips = all("[data-filter-chip]", scope);
      var cards = all("[data-movie-card]", scope);
      var empty = one("[data-empty-state]", scope);
      var activeFilter = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchText = !query || text.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || category === activeFilter;
          var visible = matchText && matchFilter;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-chip") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });

      apply();
    });
  }

  function setupScrollTop() {
    all("[data-scroll-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  window.setupMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var player = null;
    var ready = false;

    if (!video || !overlay || !source) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        player.loadSource(source);
        player.attachMedia(video);
        ready = true;
        return;
      }

      video.src = source;
      ready = true;
    }

    function start() {
      attach();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupScrollTop();
  });
})();
