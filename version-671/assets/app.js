(function () {
  function bySelector(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });

    bySelector('.mobile-panel a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
      });
    });
  }

  function initSearchForms() {
    bySelector('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './archive.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initArchiveFilters() {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }

    var cards = bySelector('.movie-card', grid);
    var input = document.querySelector('[data-archive-search-input]');
    var buttons = bySelector('[data-filter-value]');
    var empty = document.querySelector('[data-no-results]');
    var activeFilter = 'all';
    var initialQuery = getParam('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      var query = normalizeText(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var typeValue = normalizeText(card.getAttribute('data-type'));
        var genreValue = normalizeText(card.getAttribute('data-genre'));
        var matchesSearch = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === 'all' || typeValue.indexOf(activeFilter) !== -1 || genreValue.indexOf(activeFilter) !== -1;
        var show = matchesSearch && matchesFilter;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeFilter = normalizeText(button.getAttribute('data-filter-value'));
        applyFilter();
      });
    });

    applyFilter();
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = bySelector('.hero-slide', slider);
    var dots = bySelector('[data-hero-dot]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var playUrl = player.getAttribute('data-play-url');
    var hls = null;
    var prepared = false;

    function prepare() {
      if (prepared || !video || !playUrl) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = playUrl;
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
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
    initSearchForms();
    initArchiveFilters();
    initHero();
    initPlayer();
  });
})();
