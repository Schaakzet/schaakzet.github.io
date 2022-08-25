customElements.define(
  "h1-chess",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      super.connectedCallback();
      //console.log([...document.scripts].map((x) => x.src));
      this.innerHTML =
        `<h1>Roads Technology SchaakZet - <a target=_blank
        href="https://github.com/Schaakzet/schaakzet.github.io">development</a> ${document.location.pathname}</h1>` +
        `<create-html>
            a|index.html|index
            |Play:
            a|match.html|match
            a|dashboard.html|dashboard
            |Develop:
            a|sandro.html|Sandro + Bart
            button|rob.html|Rob
            a|https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation|FEN wiki
            |Database:
            button|chess-matches:deleteStartboards|Delete Startboards
            <hr>
        </create-html>`;
    }
  }
); // h1-chess
