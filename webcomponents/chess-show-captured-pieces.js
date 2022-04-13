!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-show-captured-pieces",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
      }
      processMoves(detail) {
        console.warn("processMoves", detail);
        // Array capturedWhitePieces, for-loop(get-img, show-img)
        console.log(detail.chessboard.capturedWhitePieces);
      }
    }
  );
  // ********************************************************** end IIFE
})();
