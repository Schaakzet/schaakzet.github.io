// ======================================================== <chess-board>.castlingMove
castlingMove() {
    function movePiece(from, to) {
      // @spoofmyarp onderstaande aanroepen kunnen korter met deze functie!
    }
    if (this.lastMove.chessPiece.isKing && this.lastMove.fromSquare.at == "e1") {
      if (this.lastMove.toSquare.at == "c1") {
        this.movePiece(this.getPiece(this.getSquare("a1")), "d1");
      } else if (this.lastMove.toSquare.at == "g1") {
        this.movePiece(this.getPiece(this.getSquare("h1")), "f1");
      }
    } else if (this.lastMove.chessPiece.isKing && this.lastMove.fromSquare.at == "e8") {
      if (this.lastMove.toSquare.at == "c8") {
        this.movePiece(this.getPiece(this.getSquare("a8")), "d8");
      } else if (this.lastMove.toSquare.at == "g8") {
        this.movePiece(this.getPiece(this.getSquare("h8")), "f8");
      }
    }
  }