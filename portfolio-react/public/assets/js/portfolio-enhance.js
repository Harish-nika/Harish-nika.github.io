/**
 * Portfolio enhancements: image lightbox, case-study sticky tab highlight
 */
(function () {
  "use strict";

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

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function pulseTabPanel(tabName) {
    if (prefersReducedMotion()) return;
    var section = document.getElementById(tabName);
    if (!section || !section.classList.contains("tab-content")) return;
    section.classList.remove("tab-content--animating");
    void section.offsetWidth;
    section.classList.add("tab-content--animating");
    window.setTimeout(function () {
      section.classList.remove("tab-content--animating");
    }, 380);
  }

  function wrapOpenTab() {
    if (typeof window.openTab !== "function") return;
    var original = window.openTab;
    window.openTab = function (evt, tabName) {
      original(evt, tabName);
      pulseTabPanel(tabName);
    };
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
    initLightbox();
    wrapOpenTab();
    initStickyTabs();
  });
})();
