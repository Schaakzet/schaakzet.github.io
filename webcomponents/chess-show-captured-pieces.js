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
        // Array capturedWhitePieces, for-loop(show-img)
        const capturedWhitePieces = detail.chessboard.capturedWhitePieces;
        const capturedBlackPieces = detail.chessboard.capturedBlackPieces;

        this.innerHTML = "<div id='showWhite'></div><br /><div id='showBlack'></div>";

        showWhite.innerHTML = "";
        showBlack.innerHTML = "";

        capturedWhitePieces.forEach((piece) => {
          showWhite.innerHTML += `<img src="https://schaakzet.github.io/img/${piece}.png">`;
        });

        capturedBlackPieces.forEach((piece) => {
          showBlack.innerHTML += `<img src="https://schaakzet.github.io/img/${piece}.png">`;
        });
      }
    }
  );
  // ********************************************************** end IIFE
})();
