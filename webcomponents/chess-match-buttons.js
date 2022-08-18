customElements.define(
  "chess-match-buttons",
  class extends window.CHESS.ChessBaseElement {
    connectedCallback() {
      super.connectedCallback();
      this.style = "display: block; padding-bottom: 18px";
      this.innerHTML =
        /*css*/ `<create-html>
a|index.html|schaakzet
|Play:
button|chess-match:removeMatch|Quit Match
button|chess-match:newMatch|New Match` +
        // `button|chess-match:removeMatch|removeMatch` +
        // `button|chess-match:myFEN|My FEN` +
        // `button|chess-match:forceBlackPlayer|Force Black` +
        `
button|chess-match:undoMove|undo last move
button|chess-match:remise|remise
button|chess-match:fullScreen|Full Screen
</create-html>`;
    }
  }
);
