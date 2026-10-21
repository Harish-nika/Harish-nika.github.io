/**
 * Page navigation helpers. Overlay HUD is disabled so links navigate immediately.
 */
(function () {
  "use strict";

  function playExit(_mode, href) {
    if (href) {
      window.location.assign(href);
    }
  }

  function playEnter() {
    return Promise.resolve();
  }

  function playColdLoad() {
    return Promise.resolve();
  }

  function runHomeIntro() {
    return Promise.resolve();
  }

  function bindDeployLinks() {}

  function bindRolloutLinks() {}

  window.PortfolioTransitions = {
    bindDeployLinks: bindDeployLinks,
    bindRolloutLinks: bindRolloutLinks,
    playEnter: playEnter,
    playColdLoad: playColdLoad,
    runHomeIntro: runHomeIntro,
    playDeployExit: function (href) {
      playExit("deploy", href);
    },
    playRolloutExit: function (href) {
      playExit("rollout", href);
    },
  };
})();
