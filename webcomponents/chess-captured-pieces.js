!(function () {
  const __COMPONENT_NAME__ = "chess-captured-pieces";
  // todo register the order in which pieces where captured; leave all pieces in the DOM, register data on piece itself

  // ********************************************************** IIFE
  customElements.define(
    __COMPONENT_NAME__,
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        super.connectedCallback();
        document.addEventListener(CHESS.__CHESSBOARD_READY__, (evt) => {
          let { chessboard } = evt.detail;
          let isProgressForChessboard = this.chessmatch.chessboard === chessboard;
          if (isProgressForChessboard) {
            const /* function */ img = (pieceName) => CHESS.HTML_ImageChessPiece(pieceName);
            this.innerHTML =
              `<style>` +
              `${__COMPONENT_NAME__} img{width:30px}` +
              `</style>` +
              // todo Create one function creating one DIV, call it twice
              `<div>` +
              chessboard.piecenames.capturedWhite.map(img).join("") +
              `</div>` +
              `<div>` +
              chessboard.piecenames.capturedBlack.map(img).join("") +
              `</div>`;
          }
        }); // addEventListener
      } // connectedCallback
    } // class <chess-captured-pieces>
  ); // chess-captured-pieces
  // ********************************************************** end IIFE
})();
