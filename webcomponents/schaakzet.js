!(function () {
  let loaded = [];
  function log(...args) {
    //console.log("%c L ", "background:green;color:beige;", ...args);
    loaded.push([...args]);
  }
  const CSS_files = ["chessgame","styles/chess-square","styles/chess-board","styles/chess-piece"].map((file) =>
    $createElement("link", {
      href: `./${file}.css`,
      rel: "stylesheet",
    })
  );
  loadScriptsWithDependencyOrder([
    "chess-base-class", // required baseclass
    "chess-board-analysis", // optional analysis
    "chess-piece",
    "chess-square",
    "chess-board-html",
    "chess-board",
  ]);
  loadScriptsAsynchronous([
    ["create-html", "todo-list"], // HTML components
    ["h1-chess", "chess-game-progress", "chess-match", "chess-matches"], // Chess Components
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
      src: `./webcomponents/${file}.js`,
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
