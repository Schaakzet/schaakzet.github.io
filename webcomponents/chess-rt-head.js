// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  customElements.define(
    "h1-chess",
    class extends HTMLElement {
      connectedCallback() {
        //console.log([...document.scripts].map((x) => x.src));
        this.innerHTML =
          `<h1>Roads Technology SchaakZet - <a target=_blank href="https://github.com/Schaakzet/schaakzet.github.io">development</a> ${document.location.pathname}</h1>` +
          `<div>` +
          "<a href='https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation'>FEN wiki </a> " +
          " Database: <a href='https://treeql.org/'>treeQL</a> " +
          " , <a href='https://github.com/mevdschee/php-crud-api#treeql-a-pragmatic-graphql'>PHP-CRUD-API</a> " +
          " Developer files: " +
          ["index", "sandro + Bart", "rob", "match"].map((name) => `<a href="${name.split(" ")[0]}.html">${name}</a>`).join(" - ") +
          "<hr></div>";
        document.head.append(
          Object.assign(document.createElement("link"), {
            href: "chessgame.css",
            rel: "stylesheet",
          })
        );
      }
    }
  );
})();
