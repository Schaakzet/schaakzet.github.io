customElements.define(
  "h1-chess",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      super.connectedCallback();
      //console.log([...document.scripts].map((x) => x.src));
      this.innerHTML =
        `<style>` +
        `h1-chess create-html a {
        font: bold 11px Arial;
        text-decoration: none;
        background-color: #EEEEEE;
        color: #333333;
        padding: 2px 6px 2px 6px;
        border-top: 1px solid #CCCCCC;
        border-right: 1px solid #333333;
        border-bottom: 1px solid #333333;
        border-left: 1px solid #CCCCCC;
      }` +
        `</style>` +
        `<h1>Roads Technology SchaakZet - <a target=_blank
        href="https://github.com/Schaakzet/schaakzet.github.io">development</a> ${document.location.pathname}</h1>` +
        `<create-html>
            a|index.html|index
            |Match
            a|match.html|New match
            a|seats.html|Seats
            a|dashboard.html|dashboard (todo)|`+
            // `|Develop:
            // a|sandro.html|Sandro + Bart
            // a|rob.html|Rob`+
            // `a|https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation|FEN wiki` +
        // `|Database:
        //  button|chess-matches:deleteStartboards|Delete Startboards` +
        `<hr></create-html>`;
    }
  }
); // h1-chess
