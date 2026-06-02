/**
 * Portfolio enhancements: image lightbox, case-study sticky tab highlight
 */
(function () {
  "use strict";
  var STORAGE_SCROLL_KEY = "portfolio:return-state";
  var THEME_KEY = "selected-theme";
  var THEME_ICON_KEY = "selected-icon";

  function isHomePage() {
    var p = window.location.pathname;
    return /\/$|\/index\.html$/.test(p);
  }

  function getNearestSectionId() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
    if (!sections.length) return null;
    var y = window.scrollY + 140;
    var active = sections[0].id;
    sections.forEach(function (section) {
      if (y >= section.offsetTop) active = section.id;
    });
    return active;
  }

  function saveReturnState() {
    try {
      var payload = {
        scrollY: Math.max(0, window.scrollY || 0),
        sectionId: getNearestSectionId(),
        savedAt: Date.now(),
      };
      sessionStorage.setItem(STORAGE_SCROLL_KEY, JSON.stringify(payload));
    } catch (e) {
      /* noop */
    }
  }

  function restoreReturnState() {
    if (!isHomePage()) return;
    try {
      var raw = sessionStorage.getItem(STORAGE_SCROLL_KEY);
      if (!raw) return;
      sessionStorage.removeItem(STORAGE_SCROLL_KEY);
      var payload = JSON.parse(raw);
      if (!payload || typeof payload.scrollY !== "number") return;
      if (Date.now() - (payload.savedAt || 0) > 2 * 60 * 60 * 1000) return;

      window.requestAnimationFrame(function () {
        if (payload.sectionId) {
          var section = document.getElementById(payload.sectionId);
          if (section) section.scrollIntoView({ behavior: "auto", block: "start" });
        }
        window.scrollTo({ top: payload.scrollY, behavior: "auto" });
      });
    } catch (e) {
      /* noop */
    }
  }

  function initReturnNavigationPersistence() {
    if (!isHomePage()) return;
    document.querySelectorAll('a[href$=".html"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href === "index.html") return;
      link.addEventListener("click", saveReturnState);
    });
  }

  function initThemeSync() {
    if (window.__themeManaged) return;
    var themeButton = document.getElementById("theme-button");
    var darkTheme = "dark-theme";
    var iconTheme = "uil-sun";

    var selectedTheme = localStorage.getItem(THEME_KEY);
    var selectedIcon = localStorage.getItem(THEME_ICON_KEY);

    if (selectedTheme) {
      document.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
    }
    if (themeButton && selectedIcon) {
      themeButton.classList[selectedIcon === "uil-moon" ? "add" : "remove"](iconTheme);
    }

    if (themeButton && !themeButton.dataset.themeBound) {
      window.__themeManaged = true;
      themeButton.dataset.themeBound = "1";
      themeButton.addEventListener("click", function () {
        document.body.classList.toggle(darkTheme);
        themeButton.classList.toggle(iconTheme);
        localStorage.setItem(THEME_KEY, document.body.classList.contains(darkTheme) ? "dark" : "light");
        localStorage.setItem(THEME_ICON_KEY, themeButton.classList.contains(iconTheme) ? "uil-moon" : "uil-sun");
      });
    }
  }

  function initRevealAnimations() {
    var targets = document.querySelectorAll(
      ".home__content, .about__container, .qualification__data, .project-card, .portfolio__content, .skills__content"
    );
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add("fx-reveal");
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initLightbox() {
    var lightbox = document.getElementById("portfolio-lightbox");
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.id = "portfolio-lightbox";
      lightbox.className = "portfolio-lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("aria-label", "Enlarged image");
      lightbox.innerHTML =
        '<button type="button" class="portfolio-lightbox__close" aria-label="Close">&times;</button>' +
        '<img class="portfolio-lightbox__img" alt="" />';
      document.body.appendChild(lightbox);
    }

    var imgEl = lightbox.querySelector(".portfolio-lightbox__img");
    var closeBtn = lightbox.querySelector(".portfolio-lightbox__close");

    function open(src, alt) {
      imgEl.src = src;
      imgEl.alt = alt || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      imgEl.removeAttribute("src");
    }

    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });

    document.querySelectorAll(".project-img--ui").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        open(thumb.src, thumb.alt);
      });
    });
  }

  function initStickyTabs() {
    var wrap = document.querySelector(".case-study-tabs-wrap");
    if (!wrap) return;

    var tabs = wrap.querySelectorAll(".tab-btn");
    var panels = wrap.querySelectorAll(".tab-content");
    if (!tabs.length) return;

    var panelIds = [];
    panels.forEach(function (p) {
      if (p.id) panelIds.push(p.id);
    });

    function setActiveTab(id) {
      tabs.forEach(function (btn) {
        var target = btn.getAttribute("data-tab");
        btn.classList.toggle("active", target === id);
      });
    }

    if ("IntersectionObserver" in window && panelIds.length) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
              setActiveTab(entry.target.id);
            }
          });
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] }
      );
      panelIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initThemeSync();
    restoreReturnState();
    initReturnNavigationPersistence();
    initRevealAnimations();
    initLightbox();
    initStickyTabs();
  });
})();
