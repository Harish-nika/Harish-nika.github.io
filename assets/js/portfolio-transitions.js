/**
 * DevOps-style page transitions: deploy to case study, rollout back to portfolio.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "portfolioNavTransition";
  var EXIT_MS = 640;
  var ENTER_MS = 720;

  var CASE_STUDY_PAGES = {
    "dme-project.html": true,
    "fexpert.html": true,
    "content-moderator.html": true,
    "lang-tool.html": true,
    "medbot.html": true,
    "profile.html": true,
  };

  var DEPLOY_STAGES = ["COMPOSE UP", "HEALTH CHECK", "DEPLOYING CASE STUDY"];
  var DEPLOY_ENTER_STAGES = ["IMAGE PULLED", "PODS READY", "CASE STUDY LIVE"];
  var ROLLOUT_STAGES = ["DRAINING TRAFFIC", "ROLLOUT REVISION", "ROUTING TO PORTFOLIO"];
  var ROLLOUT_ENTER_STAGES = ["SYNC COMPLETE", "INGRESS UPDATED", "PORTFOLIO ONLINE"];

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function pageNameFromUrl(url) {
    var path = url.pathname.split("/").pop() || "";
    return path || "index.html";
  }

  function isCaseStudyPageName(name) {
    return !!CASE_STUDY_PAGES[name];
  }

  function isIndexPageName(name) {
    return !name || name === "index.html";
  }

  function isIndexHref(anchor) {
    try {
      var url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      return isIndexPageName(pageNameFromUrl(url));
    } catch (e) {
      return false;
    }
  }

  function isCaseStudyHref(anchor) {
    try {
      var url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      return isCaseStudyPageName(pageNameFromUrl(url));
    } catch (e) {
      return false;
    }
  }

  function shouldHandleClick(event, anchor) {
    if (prefersReducedMotion() || event.defaultPrevented) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (event.button !== 0) return false;
    if (!(anchor instanceof HTMLAnchorElement)) return false;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
    var href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return false;
    }
    return true;
  }

  function readTransition() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeTransition(mode) {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode: mode, at: Date.now() })
    );
  }

  function clearTransition() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function ensureOverlay() {
    var overlay = document.getElementById("portfolio-nav-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "portfolio-nav-overlay";
    overlay.className = "portfolio-nav-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="portfolio-nav-overlay__scan" aria-hidden="true"></div>' +
      '<div class="portfolio-nav-overlay__panels" aria-hidden="true">' +
      '<div class="portfolio-nav-overlay__panel portfolio-nav-overlay__panel--left"></div>' +
      '<div class="portfolio-nav-overlay__panel portfolio-nav-overlay__panel--right"></div>' +
      "</div>" +
      '<div class="portfolio-nav-overlay__hud">' +
      '<p class="portfolio-nav-overlay__stage"></p>' +
      '<p class="portfolio-nav-overlay__label"></p>' +
      '<div class="portfolio-nav-overlay__bar" aria-hidden="true"><span></span></div>' +
      "</div>";
    document.body.appendChild(overlay);
    return overlay;
  }

  function setHud(overlay, stage, label) {
    var stageEl = overlay.querySelector(".portfolio-nav-overlay__stage");
    var labelEl = overlay.querySelector(".portfolio-nav-overlay__label");
    if (stageEl) stageEl.textContent = stage || "";
    if (labelEl) labelEl.textContent = label || "";
  }

  function runStages(overlay, stages, totalMs) {
    if (!stages.length) return function () {};
    var stepMs = Math.max(120, Math.floor(totalMs / stages.length));
    var index = 0;
    setHud(overlay, stages[0], stages[stages.length - 1]);
    var timer = window.setInterval(function () {
      index += 1;
      if (index >= stages.length) {
        window.clearInterval(timer);
        return;
      }
      setHud(overlay, stages[index], stages[stages.length - 1]);
    }, stepMs);
    return function () {
      window.clearInterval(timer);
    };
  }

  function activateOverlay(overlay, modeClass) {
    document.body.classList.add("is-portfolio-nav-active");
    overlay.classList.remove(
      "is-deploy-exit",
      "is-deploy-enter",
      "is-rollout-exit",
      "is-rollout-enter"
    );
    overlay.classList.add("is-active", modeClass);
    overlay.setAttribute("aria-hidden", "false");
  }

  function deactivateOverlay(overlay) {
    overlay.classList.remove(
      "is-active",
      "is-deploy-exit",
      "is-deploy-enter",
      "is-rollout-exit",
      "is-rollout-enter"
    );
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-portfolio-nav-active");
  }

  function playExit(mode, href, stages) {
    if (prefersReducedMotion()) {
      window.location.assign(href);
      return;
    }

    writeTransition(mode);
    var overlay = ensureOverlay();
    var modeClass = mode === "rollout" ? "is-rollout-exit" : "is-deploy-exit";
    activateOverlay(overlay, modeClass);
    var stopStages = runStages(overlay, stages, EXIT_MS - 80);

    window.setTimeout(function () {
      stopStages();
      window.location.assign(href);
    }, EXIT_MS);
  }

  function playEnter() {
    var transition = readTransition();
    if (!transition) return;
    clearTransition();

    if (prefersReducedMotion()) return;

    var onCaseStudy = document.body.classList.contains("case-study");
    var onProfile = isCaseStudyPageName(pageNameFromUrl(new URL(window.location.href)));
    var onPortfolioHome = isIndexPageName(pageNameFromUrl(new URL(window.location.href)));
    var mode = transition.mode;
    var overlay = ensureOverlay();
    var stages;
    var modeClass;

    if (mode === "deploy" && (onCaseStudy || onProfile)) {
      stages = DEPLOY_ENTER_STAGES;
      modeClass = "is-deploy-enter";
    } else if (mode === "rollout" && onPortfolioHome) {
      stages = ROLLOUT_ENTER_STAGES;
      modeClass = "is-rollout-enter";
    } else {
      return;
    }

    activateOverlay(overlay, modeClass);
    var stopStages = runStages(overlay, stages, ENTER_MS - 120);

    window.setTimeout(function () {
      stopStages();
      overlay.classList.add("is-finishing");
      window.setTimeout(function () {
        deactivateOverlay(overlay);
        overlay.classList.remove("is-finishing");
      }, 280);
    }, ENTER_MS);
  }

  function bindDeployLinks(links) {
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (!shouldHandleClick(event, link) || !isCaseStudyHref(link)) return;
        event.preventDefault();
        playExit("deploy", link.href, DEPLOY_STAGES);
      });
    });
  }

  function bindRolloutLinks() {
    document.querySelectorAll("a[href]").forEach(function (link) {
      if (!isIndexHref(link)) return;
      link.addEventListener("click", function (event) {
        if (!shouldHandleClick(event, link)) return;
        event.preventDefault();
        playExit("rollout", link.href, ROLLOUT_STAGES);
      });
    });
  }

  window.PortfolioTransitions = {
    bindDeployLinks: bindDeployLinks,
    bindRolloutLinks: bindRolloutLinks,
    playEnter: playEnter,
    playDeployExit: function (href) {
      playExit("deploy", href, DEPLOY_STAGES);
    },
    playRolloutExit: function (href) {
      playExit("rollout", href, ROLLOUT_STAGES);
    },
  };

  function init() {
    playEnter();
    var page = pageNameFromUrl(new URL(window.location.href));
    if (document.body.classList.contains("case-study") || isCaseStudyPageName(page)) {
      bindRolloutLinks();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
