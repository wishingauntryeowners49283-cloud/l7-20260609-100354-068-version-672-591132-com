(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var nav = document.getElementById("siteNav");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle("is-active", position === active);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle("is-active", position === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterArea = document.querySelector("[data-filterable]");
    var searchInput = document.querySelector("[data-search-input]");
    var emptyState = document.querySelector("[data-empty-state]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));

    if (filterArea && searchInput) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      var activeFilter = "all";
      var cards = Array.prototype.slice.call(filterArea.querySelectorAll(".movie-card"));

      if (initialQuery) {
        searchInput.value = initialQuery;
      }

      function applyFilter() {
        var query = normalize(searchInput.value);
        var visible = 0;

        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var meta = normalize(card.getAttribute("data-meta"));
          var tags = normalize(card.getAttribute("data-tags"));
          var type = card.getAttribute("data-type") || "";
          var textMatch = !query || title.indexOf(query) >= 0 || meta.indexOf(query) >= 0 || tags.indexOf(query) >= 0;
          var typeMatch = activeFilter === "all" || type === activeFilter;
          var showCard = textMatch && typeMatch;
          card.hidden = !showCard;
          if (showCard) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      searchInput.addEventListener("input", applyFilter);
      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-value") || "all";
          filterButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilter();
        });
      });

      applyFilter();
    }

    var rankButtons = Array.prototype.slice.call(document.querySelectorAll("[data-rank-button]"));
    var rankPanels = Array.prototype.slice.call(document.querySelectorAll("[data-rank-panel]"));

    if (rankButtons.length && rankPanels.length) {
      rankButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var key = button.getAttribute("data-rank-button");
          rankButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          rankPanels.forEach(function (panel) {
            panel.classList.toggle("is-active", panel.getAttribute("data-rank-panel") === key);
          });
        });
      });
    }
  });
})();
