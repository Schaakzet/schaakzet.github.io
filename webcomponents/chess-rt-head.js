// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  customElements.define(
    "h1-chess",
    class extends HTMLElement {
      connectedCallback() {
        //console.log([...document.scripts].map((x) => x.src));
        this.innerHTML =
          `<h1>Roads Technology SchaakZet - <a target=_blank href="https://github.com/Schaakzet/schaakzet.github.io">development</a> ${document.location.pathname}</h1>` +
          `<div>`+
          ["index","sandro","rob","match"].map(name=>`<a href="${name}.html">${name}</a>`).join(" - ") +"<hr></div>"
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
