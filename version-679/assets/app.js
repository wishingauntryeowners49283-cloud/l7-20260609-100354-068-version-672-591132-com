(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5000);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        resetTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(current + 1);
        resetTimer();
      });
    }

    setSlide(0);
    startTimer();
  }

  function initSearchJump() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-jump]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./all.html";
        var url = value ? target + "?q=" + encodeURIComponent(value) : target;
        window.location.href = url;
      });
    });
  }

  function initFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("input[name='q']");
      var type = panel.querySelector("select[name='type']");
      var region = panel.querySelector("select[name='region']");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);

      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      function matches(card, query, typeValue, regionValue) {
        var text = (card.getAttribute("data-text") || card.textContent || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var typeMatch = !typeValue || cardType.indexOf(typeValue) !== -1;
        var regionMatch = !regionValue || cardRegion.indexOf(regionValue) !== -1;
        var queryMatch = !query || text.indexOf(query) !== -1;
        return typeMatch && regionMatch && queryMatch;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        cards.forEach(function (card) {
          card.hidden = !matches(card, query, typeValue, regionValue);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      if (region) {
        region.addEventListener("change", apply);
      }
      panel.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  function initPlayer() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell[data-video]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var trigger = shell.querySelector(".play-cover");
      var src = shell.getAttribute("data-video");
      var hls = null;

      if (!video || !src) {
        return;
      }

      function playVideo() {
        shell.classList.add("is-playing");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (video.getAttribute("src") !== src) {
            video.setAttribute("src", src);
          }
          video.play();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hls) {
            hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play();
            });
          } else {
            video.play();
          }
          return;
        }
        if (video.getAttribute("src") !== src) {
          video.setAttribute("src", src);
        }
        video.play();
      }

      if (trigger) {
        trigger.addEventListener("click", playVideo);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchJump();
    initFilter();
    initPlayer();
  });
})();
