customElements.define(
  "chess-match-buttons",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      super.connectedCallback();
      this.style = "display: block; padding-bottom: 18px";
      this.innerHTML = /*css*/ `<create-html>
a|index.html|schaakzet
|Play:
button|chess-match:createMatch|createMatch
button|chess-match:resumeMatch|resumeMatch
button|chess-match:removeMatch|removeMatch
button|chess-match:myFEN|My FEN
button|chess-match:forceBlackPlayer|Force Black
button|chess-match:undoMove|undo last move
button|chess-match:remise|remise
button|chess-match:fullScreen|Full Screen
</create-html>`;
    }
  }
);
