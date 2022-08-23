!(function () {
  if (window.CHESS) {
    console.error("Don't load schaakzet.js again!");
    return; // prevent loading again
  }

  let base_url = ".";
  if (location.hostname.includes("github") || location.hostname.includes("schaakzet")) base_url = "https://schaakzet.github.io";

  let loaded = [];
  function log(...args) {
    //console.log("%c L ", "background:green;color:beige;", ...args);
    loaded.push([...args]);
  }
  const CSS_files = ["styles/chess-dashboard", "styles/chess-square", "styles/chess-board", "styles/chess-piece"].map((file) =>
    $createElement("link", {
      href: base_url + `/${file}.css`,
      rel: "stylesheet",
    })
  );
  loadScriptsWithDependencyOrder([
    "../console",
    "app-base-functions", // generic functions
    "chess-base-constants", // required
    "chess-base-api-rt", // required for database API
    "chess-eventsource", // required for EventSource API
    "chess-base-class", // required baseclass
    "chess-base-class-components", // required baseclass for <piece> <square> <board>
    "chess-board-analysis", // optional analysis
    "chess-piece",
    "chess-square",
    "chess-board-html",
    "chess-board",
    "chess-boards",
  ]);

  function $createElement(tag, props = {}) {
    return Object.assign(document.createElement(tag), props);
  }

  function script({
    file,
    type = "",
    onload = () => {
      log("script loaded", idx, file);
    },
    async = true,
    idx = 0,
  }) {
    let scriptElement = $createElement("script", {
      src:
        base_url +
        `/webcomponents/${file}.js?` +
        String(new Date() / 1)
          .split("")
          .slice(-5)
          .join(""),
      type,
      onerror: () => {
        console.warn("script load error", file);
      },
      onload,
      //async
    });
    return scriptElement;
  }
  function loadScriptsWithDependencyOrder(scripts) {
    if (scripts.length) {
      let file = scripts.shift();
      document.head.append(
        script({
          file,
          onload: () => {
            log("script dependency loaded", file);
            loadScriptsWithDependencyOrder(scripts);
          },
        })
      );
    } else {
      loadScriptsAsynchronous([
        ["create-html", "todo-list"], // HTML components
        ["h1-chess"],
        ["chess-game-progress", "chess-captured-pieces"],
        ["chess-match", "chess-match-buttons", "chess-matches", "chess-players"], // Chess Components
        ["chess-availablegames"],
      ]);

      console.groupCollapsed(`%c Loaded ${loaded.length} scripts `, "background:green;color:gold");
      loaded.map((args) => console.log(...args));
      console.groupEnd();
    }
  }
  function loadScriptsAsynchronous(scripts = []) {
    document.head.append(
      ...CSS_files, // CSS <link>
      ...scripts.flat().map((file, idx) => script({ file, idx }))
    );
  }
})();
