customElements.define(
  "chess-match-buttons",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      this.innerHTML = /*css*/ `<create-html>
a|index.html|schaakzet
|Play:
button|chess-match:initGame|START
button|chess-match:restartGame|restart
button|chess-match:undoMove|Undo last move
</create-html>`;
    }
  }
);
