!(function () {
  /* BaseClass for <chess-board>,<chess-square>,<chess-piece>

  class:ChessBaseElement
    -► class:ChessBaseSquarePieceElement
      -► component:<chess-square>
      -► component:<chess-piece>
      -► component:<chess-board>
  */

  // **********************************************************  CHESS.ChessBaseSquarePieceElement
  CHESS.ChessBaseSquarePieceElement = class extends CHESS.ChessBaseElement {
    constructor() {
      //! test: no need for a constructor with only a super() call
      super();
    }

    // getters and setters for <chess-square> <chess-piece> <chess-board> Web Components

    // ======================================================== <chess-*>.isPiece
    get isChessPiece() {
      return this.localName == CHESS.__WC_CHESS_PIECE__;
    }
    // ======================================================== <chess-*>.at
    // returns square location "b8"
    get at() {
      return (
        this.isChessPiece
          ? this.square // for <chess-piece>
          : this
      ) // for <chess-square>
        .getAttribute(CHESS.__WC_ATTRIBUTE_AT__);
    }
    set at(at) {
      if (this.isChessPiece) {
        this.chessboard.movePiece(this, at);
      } else {
        console.error("Can't set at on", this);
      }
    }
    // ======================================================== <chess-*>.file
    get file() {
      return this.at[0];
    }
    // ======================================================== <chess-*>.rank
    get rank() {
      return this.at[1];
    }
    // ======================================================== <chess-*>.atFile
    atFile(file) {
      return this.file == file;
    }
    // ======================================================== <chess-*>.atRank
    atRank(rank) {
      return this.rank == rank;
    }
    // ======================================================== <chess-*>.chessboard
    get chessboard() {
      return (
        this.closest(CHESS.__WC_CHESS_BOARD__) || // closest("<chess-board>")
        console.error("Can't find <chess-board> from", this)
      );
    }
    // ======================================================== <chess-*>.square
    get square() {
      return (
        this.closest(CHESS.__WC_CHESS_SQUARE__) || // closest("<chess-square>");
        console.error("Can't find <chess-square> from", this)
      );
    }
  }; // class:ChessBaseSquarePieceElement
})(); // end IIFE
