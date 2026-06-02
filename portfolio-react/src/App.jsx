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
    ];
    const scripts = [
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
        script.defer = true;
        script.setAttribute("data-legacy", src);
        document.body.appendChild(script);
        addedNodes.push(script);
      }
    });

    return () => {};
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lottieConfig = {
      hero: {
        path: "/assets/animations/lottie/hero-ai-network.json",
        loop: true,
      },
      about: {
        path: "/assets/animations/lottie/about-ml-research.json",
        loop: true,
      },
      experience: {
        path: "/assets/animations/lottie/experience-devops-pipeline.json",
        loop: true,
      },
      skills: {
        path: "/assets/animations/lottie/skills-data-flow.json",
        loop: true,
      },
      projects: {
        path: "/assets/animations/lottie/projects-cloud-ops.json",
        loop: true,
      },
      contact: {
        path: "/assets/animations/lottie/contact-loop.json",
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

    return () => {
      observer.disconnect();
      lottieInstances.forEach(({ instance }) => instance.destroy());
    };
  }, []);

  return <div className="legacy-wrapper" dangerouslySetInnerHTML={{ __html: legacyHtml }} />;
}

export default App;
