!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-show-captured-pieces",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        this.render();

        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
        document.addEventListener("restartMatch", (evt) => {
          this.clear();
        });
      }

      render() {
        this.innerHTML = "<div id='showWhite'></div><br /><div id='showBlack'></div>";
      }

      clear() {
        this.showWhite.innerHTML = "";
        this.showBlack.innerHTML = "";
      }

      get showWhite() {
        return this.querySelector("#showWhite");
      }
      get showBlack() {
        return this.querySelector("#showBlack");
      }

      processMoves(detail) {
        console.warn("processMoves", detail);
        let { capturedWhitePieces, capturedBlackPieces } = detail.chessboard;
        this.clear();

        function listPieces(pieces, showDiv) {
          pieces.forEach((piece) => {
            showDiv.innerHTML += `<img src="https://schaakzet.github.io/img/${piece}.png">`;
          });
        }

        listPieces(capturedWhitePieces, this.showWhite);
        listPieces(capturedBlackPieces, this.showBlack);
      }
    }
  );
  // ********************************************************** end IIFE
})();
