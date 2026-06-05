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

  function initRevealOnScroll() {
    var items = document.querySelectorAll(".reveal-on-scroll");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initSkillsPillars() {
    var pillars = document.querySelectorAll(".skills__pillar");
    var panels = document.querySelectorAll(".skills__stage-panel");
    if (!pillars.length) return;

    function activate(pillarId) {
      pillars.forEach(function (btn) {
        var active = btn.getAttribute("data-pillar") === pillarId;
        btn.classList.toggle("skills__pillar--active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (panel) {
        panel.classList.toggle(
          "skills__stage-panel--active",
          panel.getAttribute("data-stage") === pillarId
        );
      });
    }

    pillars.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activate(btn.getAttribute("data-pillar"));
      });
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    function runCounter(el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      if (prefersReducedMotion()) {
        el.textContent = String(target);
        return;
      }
      var start = 0;
      var duration = 1200;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        el.textContent = String(Math.floor(start + (target - start) * progress));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initProjectsShowcase() {
    var root = document.querySelector("[data-projects-showcase]");
    if (!root) return;

    var scroller = root.querySelector(".projects-showcase__scroller");
    var track = root.querySelector(".projects-showcase__track");
    var slides = root.querySelectorAll(".projects-showcase__slide");
    var progressFill = root.querySelector(".projects-showcase__progress-fill");
    var mqDesktop = window.matchMedia("(min-width: 1024px)");

    function updateSlideVisibility() {
      slides.forEach(function (slide) {
        var rect = slide.getBoundingClientRect();
        var inView = rect.left < window.innerWidth * 0.75 && rect.right > window.innerWidth * 0.25;
        slide.classList.toggle("is-visible", inView || !mqDesktop.matches);
      });
    }

    function onScroll() {
      if (!mqDesktop.matches || !scroller || !track) {
        updateSlideVisibility();
        return;
      }

      var rect = scroller.getBoundingClientRect();
      var total = scroller.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      var progress = scrolled / total;
      var maxShift = track.scrollWidth - window.innerWidth;

      track.style.transform = "translateX(" + -progress * maxShift + "px)";

      if (progressFill) {
        progressFill.style.strokeDashoffset = String(1 - progress);
      }

      updateSlideVisibility();
    }

    function onResize() {
      if (!mqDesktop.matches && track) {
        track.style.transform = "";
      }
      onScroll();
    }

    if ("IntersectionObserver" in window) {
      var slideObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          });
        },
        { threshold: 0.2 }
      );
      slides.forEach(function (slide) {
        slideObserver.observe(slide);
      });
    } else {
      slides.forEach(function (slide) {
        slide.classList.add("is-visible");
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    mqDesktop.addEventListener("change", onResize);
    onResize();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLightbox();
    wrapOpenTab();
    initStickyTabs();
    initRevealOnScroll();
    initSkillsPillars();
    initCounters();
    initProjectsShowcase();
  });
})();
