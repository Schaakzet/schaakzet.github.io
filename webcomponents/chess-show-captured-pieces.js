!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-show-captured-pieces",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        super.connectedCallback();
        this.render();

        document.addEventListener("restartMatch", (evt) => this.clear());
        document.addEventListener("undoMove", (evt) => this.deleteMove(evt.detail));
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
      }

      render() {
        let style = "<style>#showWhite img, #showBlack img{width:30px}</style>";
        this.innerHTML = style + "<div id='showWhite'></div><br /><div id='showBlack'></div>";
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

      deleteMove(detail) {
        console.log(detail.chessboard.getAttribute);
        let lastSquare = detail.toSquare;
        let color = detail.chessboard.getAttribute("playerturn");
        let { capturedWhitePieces, capturedBlackPieces } = detail.chessboard;
        if (lastSquare.piece) {
          if (color == CHESS.__PLAYER_BLACK__) {
            capturedWhitePieces.pop();
          } else {
            capturedBlackPieces.pop();
          }
        }
        console.log(capturedWhitePieces, capturedBlackPieces);
        this.processMoves(detail);
      }
    }
  );
  // ********************************************************** end IIFE
})();
