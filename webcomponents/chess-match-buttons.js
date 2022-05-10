customElements.define(
  "chess-match-buttons",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      this.style = "display: block; padding-bottom: 18px";
      this.innerHTML = /*css*/ `<create-html>
a|index.html|schaakzet
|Play:
button|chess-match:updateMatch|save players
button|chess-match:restartGame|new game
button|chess-match:myFEN|My FEN
button|chess-match:undoMove|undo last move
button|chess-match:remise|remise
button|chess-match:fullScreen|Full Screen
</create-html>`;
    }
  }
);
