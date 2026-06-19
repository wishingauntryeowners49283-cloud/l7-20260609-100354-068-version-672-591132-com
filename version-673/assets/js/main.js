(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = selectAll('[data-hero-slide]');
    if (slides.length < 2) {
      return;
    }
    var dots = selectAll('[data-hero-dot]');
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
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

    restart();
  }

  function setupSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function setupFilterPanels() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var queryInput = panel.querySelector('[data-filter-query]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var countBox = panel.querySelector('[data-filter-count]');
      var cards = selectAll('[data-card]');
      var empty = document.querySelector('[data-empty-state]');
      var urlQuery = getQueryValue();

      if (queryInput && urlQuery) {
        queryInput.value = urlQuery;
      }

      function matches(card, query, year, type) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var queryOk = !query || haystack.indexOf(query.toLowerCase()) !== -1;
        var yearOk = !year || card.getAttribute('data-year') === year;
        var typeOk = !type || card.getAttribute('data-type') === type;
        return queryOk && yearOk && typeOk;
      }

      function apply() {
        var query = queryInput ? queryInput.value.trim() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card, query, year, type);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (countBox) {
          countBox.textContent = visible ? '匹配 ' + visible + ' 部' : '暂无匹配';
        }
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [queryInput, yearSelect, typeSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupSmoothAnchor() {
    selectAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href');
        var target = id && id.length > 1 ? document.querySelector(id) : null;
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupSearchForms();
    setupFilterPanels();
    setupSmoothAnchor();
  });
})();
