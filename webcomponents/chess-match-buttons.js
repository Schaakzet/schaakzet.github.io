customElements.define(
  "chess-match-buttons",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      this.innerHTML = /*css*/ `<style>chess-match-buttons {padding: 8px;}</style>
      <create-html>
a|index.html|schaakzet
|Play:
button|chess-match:initGame|START
button|chess-match:restartGame|restart
button|chess-match:undoMove|undo last move
button|chess-match:remise|remise
</create-html>`;
    }
  }
);
