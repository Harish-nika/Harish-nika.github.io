import "./App.css";
import { useEffect } from "react";
import lottie from "lottie-web";
import legacyHtml from "./legacy-portfolio.html?raw";

function App() {
  useEffect(() => {
    if (window.__legacyAssetsLoaded) {
      return;
    }
    window.__legacyAssetsLoaded = true;

    document.title = "Harish Kumar - AI ML Engineer";

    const head = document.head;
    const links = [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
      "https://unicons.iconscout.com/release/v3.0.6/css/line.css",
      "/assets/css/swiper-bundle.min.css",
      "/assets/css/styles.css",
      "/assets/css/portfolio-enhance.css",
      "/assets/css/portfolio-transitions.css",
    ];
    const scripts = [
      "/assets/js/portfolio-transitions.js",
      "/assets/js/swiper-bundle.min.js",
      "/assets/js/main.js",
      "/assets/js/portfolio-enhance.js",
    ];

    const addedNodes = [];

    links.forEach((href) => {
      if (!document.querySelector(`link[data-legacy="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute("data-legacy", href);
        head.appendChild(link);
        addedNodes.push(link);
      }
    });

    scripts.forEach((src) => {
      if (!document.querySelector(`script[data-legacy="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        // Dynamic scripts are async by default; force ordered execution.
        script.async = false;
        script.setAttribute("data-legacy", src);
        document.body.appendChild(script);
        addedNodes.push(script);
      }
    });

    return () => {};
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;
    const cleanupFns = [];
    const transitionTimers = [];

    const addTemporaryBodyClass = (className, duration = 650) => {
      body.classList.add(className);
      const timer = window.setTimeout(() => {
        body.classList.remove(className);
      }, duration);
      transitionTimers.push(timer);
    };

    if (!reducedMotion) {
      body.classList.add("is-page-entering");
      const enterTimer = window.setTimeout(() => {
        body.classList.remove("is-page-entering");
      }, 850);
      transitionTimers.push(enterTimer);
    }
    // Balanced sitewide motifs: AI intro, research, education vs K8s/GitOps pipeline,
    // model graph, API deploy, sci-fi cert HUD, contact loop.
    const lottieConfig = {
      hero: {
        path: "/assets/animations/lottie/hero-ai-network.json",
        loop: true,
      },
      about: {
        path: "/assets/animations/lottie/about-ml-research.json",
        loop: true,
      },
      experienceAcademic: {
        path: "/assets/animations/lottie/experience-academic-research.json",
        loop: true,
      },
      experienceProfessional: {
        path: "/assets/animations/lottie/experience-mlops-workflow.json",
        loop: true,
      },
      skills: {
        path: "/assets/animations/lottie/skills-ml-graph.json",
        loop: true,
      },
      projects: {
        path: "/assets/animations/lottie/projects-ai-delivery.json",
        loop: true,
      },
      contact: {
        path: "/assets/animations/lottie/contact-loop.json",
        loop: true,
      },
      certs: {
        path: "/assets/animations/lottie/certs-scifi-hud.json",
        loop: true,
      },
    };

    const lottieInstances = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const container = entry.target;
          const animation = lottieInstances.find((item) => item.container === container)?.instance;

          if (!animation) {
            return;
          }
          if (entry.isIntersecting) {
            animation.play();
          } else {
            animation.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

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

    Object.entries(lottieConfig).forEach(([id, config]) => {
      const container = document.querySelector(`[data-lottie-id="${id}"]`);
      if (!container) {
        return;
      }
      const instance = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: config.loop,
        autoplay: !reducedMotion,
        path: config.path,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true,
        },
      });

      if (reducedMotion) {
        instance.goToAndStop(0, true);
      } else {
        observer.observe(container);
      }
      lottieInstances.push({ container, instance });
    });

    const experienceButtons = Array.from(document.querySelectorAll(".qualification__button"));
    const experienceAnimationById = {
      experienceAcademic: lottieInstances.find((item) => item.container.dataset.lottieId === "experienceAcademic"),
      experienceProfessional: lottieInstances.find((item) => item.container.dataset.lottieId === "experienceProfessional"),
    };

    const syncExperienceAnimation = (targetId) => {
      const showAcademic = targetId === "#education";
      const academicContainer = experienceAnimationById.experienceAcademic?.container;
      const professionalContainer = experienceAnimationById.experienceProfessional?.container;

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
        experienceAnimationById.experienceProfessional?.instance.pause();
        experienceAnimationById.experienceAcademic?.instance.play();
      } else {
        experienceAnimationById.experienceAcademic?.instance.pause();
        experienceAnimationById.experienceProfessional?.instance.play();
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
      // wait for class toggle in legacy script to settle
      if (!reducedMotion) {
        addTemporaryBodyClass("is-experience-transitioning", 520);
      }
      window.requestAnimationFrame(() => syncExperienceAnimation(targetId));
    };

    experienceButtons.forEach((button) => {
      button.addEventListener("click", onExperienceTabClick);
    });
    syncExperienceAnimation(getActiveExperienceTab());

    const projectPageNames = new Set([
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

    const bindPortfolioTransitions = () => {
      if (!window.PortfolioTransitions) {
        const waitTimer = window.setTimeout(bindPortfolioTransitions, 40);
        transitionTimers.push(waitTimer);
        return;
      }
      window.PortfolioTransitions.playEnter();
      window.PortfolioTransitions.bindDeployLinks(projectNavigationLinks);
    };
    bindPortfolioTransitions();

    return () => {
      observer.disconnect();
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
