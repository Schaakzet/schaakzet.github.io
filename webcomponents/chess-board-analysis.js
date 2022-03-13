/**
 * adding analysis function to EXISTING global CHESS Object
 */
window.CHESS.analysis = ($chessboard, type = "") => {
  const getSquare = (v) => $chessboard.getSquare(v);
  const getPiece = (v) => $chessboard.getPiece(v);
  const kingSquare = (color) => $chessboard.kingSquare(color);
  const movePiece = (piece, to) => $chessboard.movePiece(piece, to);

  let lastMovedPiece;

  if ($chessboard.lastMove) {
    lastMovedPiece = $chessboard.lastMove.toSquare.piece;

    if (type == CHESS.__ANALYSIS_ENPASSANT__) {
      enPassantPosition();
    } else if (type == CHESS.__ANALYSIS_CASTLING__) {
      castling();
    } else if (type == CHESS.__ANALYSIS_PROMOTION__) {
      promotion();
    } else analyzeWholeBoard();
  }

  function log(...args) {
    console.log("%c A ", "background:orange;", ...args);
  }
  // ======================================================== promotion
  function promotion() {
    if (lastMovedPiece.isPawnAtEnd) {
      const chosenPiece = String(prompt("Kies een stuk (toets letter in): Q, N, R, B.")); // pass parameter
      let newPiece = lastMovedPiece.color + CHESS.__PIECE_SEPARATOR__;
      switch (chosenPiece.toLowerCase()) {
        case "q":
          newPiece += CHESS.__PIECE_QUEEN__;
          break;
        case "n":
          newPiece += CHESS.__PIECE_KNIGHT__;
          break;
        case "r":
          newPiece += CHESS.__PIECE_ROOK__;
          break;
        case "b":
          newPiece += CHESS.__PIECE_BISHOP__;
          break;
        default:
          newPiece = false;
      }
      if (newPiece) $chessboard.addPiece(newPiece, lastMovedPiece.at);
    }
  }

  // ======================================================== analyzeWholeBoard
  function castling() {
    reduceCastlingArray(lastMovedPiece.at);
    // ======================================================== castlingMove
    function castlingMove(chessPiece, fromSquare, toSquare) {
      const moveSecondPiece = (from, to) => {
        movePiece(getPiece(getSquare(from)), to);
        return true;
      };
      if (fromSquare.at == CHESS.__SQUARE_WHITE_KING_START__) {
        if (toSquare.at == "c1") {
          return moveSecondPiece("a1", "d1");
        } else if (toSquare.at == "g1") {
          return moveSecondPiece("h1", "f1");
        }
      } else if (fromSquare.at == CHESS.__SQUARE_BLACK_KING_START__) {
        if (toSquare.at == "c8") {
          return moveSecondPiece("a8", "d8");
        } else if (toSquare.at == "g8") {
          return moveSecondPiece("h8", "f8");
        }
      }
      return false; // no castling move
    }

    let doneCastlingMove = false;
    if (lastMovedPiece.isKing) {
      doneCastlingMove = castlingMove(lastMovedPiece, fromSquare, toSquare);
    }
  }
  // ======================================================== analyzeWholeBoard
  function analyzeWholeBoard() {
    log("initAnalysis()", $chessboard.id, $chessboard.fen);
    initAnalysis();
    const player = $chessboard.player;
    checkMate(player);
    staleMate(player);
  }

  // ======================================================== initAnalysis
  function initAnalysis() {
    $chessboard.clearAttributes();

    for (const square of $chessboard.squares) {
      let piece = getPiece(square);
      if (piece) {
        piece.potentialMoves();
        // wit-koning
      }
    }
    for (const square of $chessboard.squares) {
      let piece = getPiece(square);
      if (piece) {
        piece.potentialKingMoves();
        // wit-koning
      }
    }
  }

  // ======================================================== enPassantPosition
  function enPassantPosition() {
    const { chessPiece, fromSquare, toSquare } = $chessboard.lastMove;
    return;
    if (chessPiece.isPawn && fromSquare.rankDistance(toSquare) == 2) {
      let position = fromSquare.file + (chessPiece.isWhite ? "3" : "6"); // file+3 OF file+6
      console.error("fix enpassant position:", position, "\n", fromSquare, "\n", toSquare);
      //console.log("En passant positie", position);
      //$chessboard.lastMove.enPassantPosition = enPassantPosition($chessboard.lastMove); // Was er een en passant square van een pion?
    }
  }
  // ======================================================== castlingInterrupt
  // False: Castling impossible
  function castlingInterrupt(color, offset) {
    // let kingPosition = "";
    // if (color ==CHESS.__PLAYER_WHITE__) {
    //   kingPosition = $chessboard.getSquare("e1");
    // } else {
    //   kingPosition = $chessboard.getSquare("e8");
    // }
    // TODO: learn above lines is same as:
    let kingPosition = getSquare(color == CHESS.__PLAYER_WHITE__ ? CHESS.__SQUARE_WHITE_KING_START__ : CHESS.__SQUARE_BLACK_KING_START__);
    if (offset < 0) {
      for (let i = -1; i >= offset; i--) {
        // TODO: volgende 5 regels zijn hetzelfde als in de 2e for loop, maak er een functie van
        let squareName = kingPosition.translate(i, 0);
        let squareElement = getSquare(squareName);
        if (squareElement.isDefendedBy(CHESS.otherPlayer(color))) {
          return false;
        }
      }
    } else if (offset > 0) {
      for (let i = 1; i <= offset; i++) {
        let squareName = kingPosition.translate(i, 0);
        let squareElement = getSquare(squareName);
        if (squareElement.isDefendedBy(CHESS.otherPlayer(color))) {
          return false;
        }
      }
    }
    return true; // Castling possible
  }
  // ======================================================== reduceCastlingArray
  function reduceCastlingArray(lastReduceMove) {
    // TODO: refactor to one single .filter method using at location as first and a function as second parameter
    if (lastReduceMove == CHESS.__SQUARE_BOTTOM_LEFT__) {
      $chessboard.castlingArray = $chessboard.castlingArray.filter((item) => item !== CHESS.__FEN_WHITE_QUEEN__);
    } else if (lastReduceMove == CHESS.__SQUARE_BOTTOM_RIGHT__) {
      $chessboard.castlingArray = $chessboard.castlingArray.filter((item) => item !== CHESS.__FEN_WHITE_KING__);
    } else if (lastReduceMove == CHESS.__SQUARE_TOP_LEFT__) {
      $chessboard.castlingArray = $chessboard.castlingArray.filter((item) => item !== CHESS.__FEN_BLACK_QUEEN__);
    } else if (lastReduceMove == CHESS.__SQUARE_TOP_RIGHT__) {
      $chessboard.castlingArray = $chessboard.castlingArray.filter((item) => item !== CHESS.__FEN_BLACK_KING__);
    } else if (lastReduceMove == CHESS.__SQUARE_WHITE_KING_START__) {
      $chessboard.castlingArray = $chessboard.castlingArray.filter((item) => item !== CHESS.__FEN_WHITE_QUEEN__ && item !== CHESS.__FEN_WHITE_KING__);
    } else if (lastReduceMove == CHESS.__SQUARE_BLACK_KING_START__) {
      $chessboard.castlingArray = $chessboard.castlingArray.filter((item) => item !== CHESS.__FEN_BLACK_QUEEN__ && item !== CHESS.__FEN_BLACK_KING__);
    }
  }
  // ======================================================== isValidGameBoard
  function isValidGameBoard() {
    const kingSquare = (color) => kingSquare(color); // get king, but without warning
    const whiteKing = kingSquare(CHESS.__PLAYER_WHITE__);
    const blackKing = kingSquare(CHESS.__PLAYER_BLACK__);
    return whiteKing && blackKing;
  }

  // ======================================================== isInCheck
  function isInCheck(color) {
    if (isValidGameBoard) {
      // make sure there are pieces on the board
      const _kingSquare = kingSquare(color);
      if (_kingSquare && _kingSquare.isAttacked) {
        log(color, "koning staat schaak door", _kingSquare.attackers);
        return true;
      }
    }
    return false;
  }
  // ======================================================== findSquaresBetween
  function findSquaresBetween(attackingPieceSquare, kingSquare) {
    const files = $chessboard.files;
    const getNum = (value) => {
      for (let i = 0; i < files.length; i++) {
        if (files[i] == value) return i;
      }
    };
    const x = getNum(kingSquare.file) - getNum(attackingPieceSquare.file); // Negatief of positief
    const y = kingSquare.rank - attackingPieceSquare.rank; // Negatief of positief
    const squaresBetweenArray = [];
    if (x == 0) {
      // verticaal
      if (y > 0) {
        for (let i = 1; i < y; i++) {
          const betweenSquare = attackingPieceSquare.translate(0, i);
          squaresBetweenArray.push(betweenSquare);
        }
      } else {
        for (let i = -1; i > y; i--) {
          const betweenSquare = attackingPieceSquare.translate(0, i);
          squaresBetweenArray.push(betweenSquare);
        }
      }
    } else if (y == 0) {
      // horizontaal
      if (x > 0) {
        for (let i = 1; i < x; i++) {
          const betweenSquare = attackingPieceSquare.translate(i, 0);
          squaresBetweenArray.push(betweenSquare);
        }
      } else {
        for (let i = -1; i > x; i--) {
          const betweenSquare = attackingPieceSquare.translate(i, 0);
          squaresBetweenArray.push(betweenSquare);
        }
      }
    } else if (Math.abs(x) == Math.abs(y)) {
      // diagonaal
      if (x > 0 && y > 0) {
        for (let i = 1; i < x; i++) {
          const betweenSquare = attackingPieceSquare.translate(i, i);
          squaresBetweenArray.push(betweenSquare);
        }
      } else if (x > 0 && y < 0) {
        for (let i = 1; i < x; i++) {
          const betweenSquare = attackingPieceSquare.translate(i, -i);
          squaresBetweenArray.push(betweenSquare);
        }
      } else if (x < 0 && y < 0) {
        for (let i = -1; i > x; i--) {
          const betweenSquare = attackingPieceSquare.translate(i, i);
          squaresBetweenArray.push(betweenSquare);
        }
      } else if (x < 0 && y > 0) {
        for (let i = -1; i > x; i--) {
          const betweenSquare = attackingPieceSquare.translate(i, -i);
          squaresBetweenArray.push(betweenSquare);
        }
      }
    }
    return squaresBetweenArray;
  }
  // ======================================================== negatingCheck
  function negatingCheck(color) {
    if (isValidGameBoard) {
      const _kingSquare = kingSquare(color);
      if (_kingSquare && _kingSquare.isAttacked) {
        if (_kingSquare.attackers.length == 3) {
          const attackingPiece = (color) => getPiece(kingAttackers(color).substring(1, 3));
          const attackingPieceSquare = (color) => attackingPiece(color).square;
          // Capture Attacking Piece --- Works only for one attacking piece, because if we get more, you can capture only one.
          if (attackingPieceSquare(color).isAttacked) {
            log("You can take the checking piece", attackingPiece(color).is, "with", attackingPieceSquare(color).getAttribute(CHESS.__WC_ATTRIBUTE_ATTACKEDBY__));
            return true;
          }
          if (attackingPiece(color)) {
            // Intervening Check --- The order is not entirely correct.
            // 1. What is the attacking piece? Q.
            // 2. Is it a horse? No.
            // 3. Is there 1 or more squares in between attacking piece and king?
            if (attackingPiece(color) !== horse(color)) {
              // We know attacking piece is not a horse, and calculate squares between.
              const fileDifference = Math.abs(attackingPieceSquare(color).file - _kingSquare(color).file);
              const rankDifference = Math.abs(attackingPieceSquare(color).rank - _kingSquare(color).rank);
              if (fileDifference >= 2 || rankDifference >= 2) {
                // 4. Left with Bishop and Rook moves.
                // 5. findSquaresBetween horizontally, vertically or diagonally.
                const squaresBetween = findSquaresBetween(attackingPieceSquare(color), _kingSquare(color));
                // 6. defendedby lower or upper. Alleen (color)-stukken en niet de koning en intervenedByPawn.
                squaresBetween.forEach((element) => {
                  if (getSquare(element).isMovesFrom(color)) {
                    log(getSquare(element), " kan er tussen");
                    return true;
                  }
                });
              }
            } else {
              log("Horse, so no squares between calculation.");
            }
          }
        }

        if (getPiece(_kingSquare(color)).moves.length >= 1) {
          // Kingmoves --- Can king move out of check.
          return true;
        }
      }
    }
    return false;
  }
  // ======================================================== checkMate
  function checkMate(color) {
    const isCheck = isInCheck(color);
    const pieceCanBeTaken = negatingCheck(color);
    if (isCheck) {
      if (pieceCanBeTaken) {
        log("You can get out of check.");
      } else {
        log("Checkmate", $chessboard.player);
        gameOver("Checkmate");
      }
    }
  }
  // ======================================================== staleMate
  function staleMate(color) {
    if (isValidGameBoard) {
      const _kingSquare = kingSquare(color);
      if (_kingSquare) {
        const kingPiece = getPiece(_kingSquare);
        const isCheck = isInCheck(color);
        const kingHasNoMoves = kingPiece.moves.length == 0;
        const kinghasFalseMoves = kingPiece.falseMoves.length > 0;
        if (!isCheck && kingHasNoMoves && kinghasFalseMoves) {
          log("Stalemate!");
          gameOver("Stalemate");
        }
        const allWhitePiecesTaken = $chessboard.capturedWhitePieces.length == 15;
        const allBlackPiecesTaken = $chessboard.capturedBlackPieces.length == 15;
        if (allWhitePiecesTaken && allBlackPiecesTaken) {
          log("Stalemate!");
          gameOver("Stalemate");
        }
      }
    }
  }
  // ======================================================== gameOver
  function gameOver(mate) {
    if (mate == "Checkmate") {
      document.getElementById("message").innerText = `Game over. ${CHESS.otherPlayer()} heeft gewonnen.`;
      // schaak3.classList.add("game_over");
    } else if (mate == "Stalemate") {
      document.getElementById("message").innerText = `Game over. Gelijkspel.`;
      // schaak3.classList.add("game_over");
    }
  }
};
