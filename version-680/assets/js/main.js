(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(next) {
                if (!slides.length) {
                    return;
                }
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
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
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        function applySearch(value) {
            var keyword = String(value || "").trim().toLowerCase();
            cards.forEach(function (card) {
                var text = String(card.getAttribute("data-search") || "").toLowerCase();
                card.hidden = Boolean(keyword) && text.indexOf(keyword) === -1;
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                applySearch(input.value);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && inputs.length) {
            inputs.forEach(function (input) {
                input.value = query;
            });
            applySearch(query);
        }
    });
})();
