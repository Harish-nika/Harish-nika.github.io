import "./App.css";
import { useEffect } from "react";
import legacyHtml from "./legacy-portfolio.html?raw";

function appendStylesheet(head, href, { defer = false } = {}) {
  if (document.querySelector(`link[data-legacy="${href}"]`)) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-legacy", href);
  if (defer) {
    link.media = "print";
    link.onload = () => {
      link.media = "all";
    };
  }
  head.appendChild(link);
}

function App() {
  useEffect(() => {
    if (window.__legacyAssetsLoaded) {
      return;
    }
    window.__legacyAssetsLoaded = true;

    document.title =
      "Harish Kumar | AI/ML Engineer & Data Mining Engine (DME) | FactEntry";

    const head = document.head;

    // Critical path: layout and typography first; icon fonts after first paint.
    const criticalLinks = [
      "/assets/css/swiper-bundle.min.css",
      "/assets/css/styles.css",
      "/assets/css/portfolio-enhance.css",
      "/assets/css/portfolio-transitions.css",
    ];
    const deferredLinks = [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
      "https://unicons.iconscout.com/release/v3.0.6/css/line.css",
    ];

    criticalLinks.forEach((href) => appendStylesheet(head, href));

    const loadDeferredIcons = () => {
      deferredLinks.forEach((href) => appendStylesheet(head, href, { defer: true }));
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadDeferredIcons, { timeout: 1200 });
    } else {
      window.setTimeout(loadDeferredIcons, 80);
    }

    const scripts = [
      "/assets/js/portfolio-transitions.js",
      "/assets/js/swiper-bundle.min.js",
      "/assets/js/main.js",
      "/assets/js/portfolio-enhance.js",
    ];

    scripts.forEach((src) => {
      if (!document.querySelector(`script[data-legacy="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.setAttribute("data-legacy", src);
        document.body.appendChild(script);
      }
    });

    return () => {};
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;
    const cleanupFns = [];
    const transitionTimers = [];
    let lottieModule = null;
    let lottieLoadPromise = null;
    const lottieInstances = [];
    const lottieLoadState = new WeakMap();

    const addTemporaryBodyClass = (className, duration = 650) => {
      body.classList.add(className);
      const timer = window.setTimeout(() => {
        body.classList.remove(className);
      }, duration);
      transitionTimers.push(timer);
    };

    const ensureLottieLoaded = () => {
      if (!lottieLoadPromise) {
        lottieLoadPromise = import("lottie-web").then((mod) => {
          lottieModule = mod.default;
          return lottieModule;
        });
      }
      return lottieLoadPromise;
    };

    if (!reducedMotion) {
      body.classList.add("is-page-entering");
    }

    const lottieConfig = {
      hero: {
        path: "/assets/animations/lottie/hero-ai-network.json",
        loop: true,
        rootMargin: "0px 0px 120px 0px",
      },
      about: {
        path: "/assets/animations/lottie/about-ml-research.json",
        loop: true,
        rootMargin: "0px 0px 160px 0px",
      },
      experienceAcademic: {
        path: "/assets/animations/lottie/experience-academic-research.json",
        loop: true,
        rootMargin: "0px 0px 200px 0px",
      },
      experienceProfessional: {
        path: "/assets/animations/lottie/experience-mlops-workflow.json",
        loop: true,
        rootMargin: "0px 0px 200px 0px",
      },
      skills: {
        path: "/assets/animations/lottie/skills-ml-graph.json",
        loop: true,
        rootMargin: "0px 0px 200px 0px",
      },
      projects: {
        path: "/assets/animations/lottie/projects-ai-delivery.json",
        loop: true,
        rootMargin: "0px 0px 240px 0px",
      },
      certs: {
        path: "/assets/animations/lottie/certs-scifi-hud.json",
        loop: true,
        rootMargin: "0px 0px 240px 0px",
      },
    };

    const findLottieRecord = (container) =>
      lottieInstances.find((item) => item.container === container);

    const loadLottieForContainer = async (container) => {
      const existing = findLottieRecord(container);
      if (existing) {
        return existing;
      }

      const state = lottieLoadState.get(container);
      if (state === "loading") {
        return new Promise((resolve) => {
          const check = () => {
            const record = findLottieRecord(container);
            if (record) {
              resolve(record);
              return;
            }
            window.requestAnimationFrame(check);
          };
          check();
        });
      }

      const id = container.dataset.lottieId;
      const config = lottieConfig[id];
      if (!config) {
        return null;
      }

      lottieLoadState.set(container, "loading");
      const lottie = await ensureLottieLoaded();
      const instance = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: config.loop,
        autoplay: false,
        path: config.path,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true,
        },
      });

      const record = { container, instance, id };
      lottieInstances.push(record);
      lottieLoadState.set(container, "loaded");

      if (reducedMotion) {
        instance.goToAndStop(0, true);
      }

      return record;
    };

    const playLottie = async (container) => {
      if (reducedMotion) {
        return;
      }
      const record = await loadLottieForContainer(container);
      record?.instance.play();
    };

    const pauseLottie = (container) => {
      const record = findLottieRecord(container);
      record?.instance.pause();
    };

    Object.entries(lottieConfig).forEach(([id, config]) => {
      const container = document.querySelector(`[data-lottie-id="${id}"]`);
      if (!container) {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playLottie(container);
            } else {
              pauseLottie(container);
            }
          });
        },
        { threshold: 0.12, rootMargin: config.rootMargin || "0px" }
      );
      observer.observe(container);
      cleanupFns.push(() => observer.disconnect());
    });

    const themedSections = Array.from(
      document.querySelectorAll(
        '#skills, #Projects, #Certifications, #contact, [data-theme-transition="skills"], [data-theme-transition="projects"], [data-theme-transition="certifications"], [data-theme-transition="contact"]'
      )
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || reducedMotion) {
            return;
          }
          const section = entry.target;
          section.classList.add("section-theme--active");
          addTemporaryBodyClass("is-section-transitioning", 450);
          const timer = window.setTimeout(() => {
            section.classList.remove("section-theme--active");
          }, 950);
          transitionTimers.push(timer);
        });
      },
      { threshold: 0.35 }
    );

    themedSections.forEach((section) => sectionObserver.observe(section));

    const experienceButtons = Array.from(document.querySelectorAll(".qualification__button"));

    const getExperienceRecord = (key) =>
      lottieInstances.find((item) => item.container.dataset.lottieId === key);

    const syncExperienceAnimation = async (targetId) => {
      const showAcademic = targetId === "#education";
      const academicContainer = document.querySelector('[data-lottie-id="experienceAcademic"]');
      const professionalContainer = document.querySelector('[data-lottie-id="experienceProfessional"]');

      if (academicContainer) {
        academicContainer.classList.toggle("lottie-slot--hidden", !showAcademic);
      }
      if (professionalContainer) {
        professionalContainer.classList.toggle("lottie-slot--hidden", showAcademic);
      }
      if (reducedMotion) {
        return;
      }

      if (showAcademic) {
        getExperienceRecord("experienceProfessional")?.instance.pause();
        if (academicContainer) {
          await playLottie(academicContainer);
        }
      } else {
        getExperienceRecord("experienceAcademic")?.instance.pause();
        if (professionalContainer) {
          await playLottie(professionalContainer);
        }
      }
    };

    const getActiveExperienceTab = () => {
      const activeButton = document.querySelector(".qualification__button.qualification__active");
      return activeButton?.getAttribute("data-target") || "#work";
    };

    const onExperienceTabClick = (event) => {
      const button = event.currentTarget;
      const targetId = button.getAttribute("data-target");
      if (!targetId) {
        return;
      }
      if (!reducedMotion) {
        addTemporaryBodyClass("is-experience-transitioning", 520);
      }
      window.requestAnimationFrame(() => {
        syncExperienceAnimation(targetId);
      });
    };

    experienceButtons.forEach((button) => {
      button.addEventListener("click", onExperienceTabClick);
    });
    syncExperienceAnimation(getActiveExperienceTab());

    const projectPageNames = new Set([
      "pai-pdf-ai.html",
      "dme-project.html",
      "dental-project.html",
      "fexpert.html",
      "content-moderator.html",
      "lang-tool.html",
      "medbot.html",
      "profile.html",
    ]);

    const projectNavigationLinks = Array.from(document.querySelectorAll("a[href]")).filter(
      (link) => {
        if (!(link instanceof HTMLAnchorElement)) {
          return false;
        }
        if (link.target === "_blank" || link.hasAttribute("download")) {
          return false;
        }
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
          return false;
        }
        let url;
        try {
          url = new URL(link.href, window.location.href);
        } catch (error) {
          return false;
        }
        if (url.origin !== window.location.origin) {
          return false;
        }
        const pageName = url.pathname.split("/").pop() || "";
        return projectPageNames.has(pageName);
      }
    );

    const finishPageEnter = () => {
      if (reducedMotion) {
        body.classList.remove("is-page-entering");
        return;
      }
      const enterTimer = window.setTimeout(() => {
        body.classList.remove("is-page-entering");
      }, 850);
      transitionTimers.push(enterTimer);
    };

    const bindPortfolioTransitions = () => {
      if (!window.PortfolioTransitions) {
        const waitTimer = window.setTimeout(bindPortfolioTransitions, 40);
        transitionTimers.push(waitTimer);
        return;
      }
      window.PortfolioTransitions.bindDeployLinks(projectNavigationLinks);
      const intro = window.PortfolioTransitions.runHomeIntro;
      if (typeof intro === "function") {
        intro().then(finishPageEnter);
      } else {
        window.PortfolioTransitions.playEnter();
        finishPageEnter();
      }
    };
    bindPortfolioTransitions();

    return () => {
      sectionObserver.disconnect();
      transitionTimers.forEach((timer) => window.clearTimeout(timer));
      body.classList.remove(
        "is-page-entering",
        "is-section-transitioning",
        "is-experience-transitioning",
        "is-portfolio-nav-active"
      );
      lottieInstances.forEach(({ instance }) => instance.destroy());
      experienceButtons.forEach((button) => {
        button.removeEventListener("click", onExperienceTabClick);
      });
      cleanupFns.forEach((cleanupFn) => cleanupFn());
    };
  }, []);

  return <div className="legacy-wrapper" dangerouslySetInnerHTML={{ __html: legacyHtml }} />;
}

export default App;
