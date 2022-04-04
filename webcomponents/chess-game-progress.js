!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-game-progress",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
      }
      processMoves(detail) {
        //console.warn("processMoves", detail.chessPiece.fen, detail);
      }
    }
  );
  // ********************************************************** end IIFE
})();
