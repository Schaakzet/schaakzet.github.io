/**
 * adding analysis function to EXISTING global CHESS Object
 */
window.CHESS.analysis = /* function */ ($chessboard, type = "") => {
  const getSquare = /* function */ (v) => $chessboard.getSquare(v);
  const getPiece = /* function */ (v) => $chessboard.getPiece(v);
  const kingSquare = /* function */ (color) => $chessboard.kingSquare(color);
  const movePiece = /* function */ (piece, to) => $chessboard.movePiece(piece, to);

  if (type == CHESS.__ANALYSIS_PRE__) {
    console.log("analyze pre");
    analyzeWholeBoard();
  }

  if (type == CHESS.__ANALYSIS_AFTER__) {
    console.log("Analysis AFTER");
    enPassantPosition();
    castling();
    promotion();
  }

  if (type == "checkcheck") {
    return isInCheck($chessboard.player);
  }

  function log(...args) {
    console.log("%c A ", "background:orange;", ...args);
  }

  // ======================================================== promotion
  function promotion() {
    console.log("Analysis PROMOTION");
    if ($chessboard.lastMove) {
      let lastMovedPiece = $chessboard.lastMove.toSquare.piece;
      if (lastMovedPiece.isPawnAtEnd && $chessboard.id !== CHESS.__TESTBOARD_FOR_MOVES__) {
        const chosenPiece = String(prompt("Kies een stuk (toets letter in): Q, N, R, B.")); // pass parameter
        let newPiece = lastMovedPiece.color + "-";
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
        if (lastMovedPiece.isWhite) {
          $chessboard.capturedWhitePieces.push(lastMovedPiece.is);
        } else {
          $chessboard.capturedBlackPieces.push(lastMovedPiece.is);
        }
        console.log("promotion");
      }
    }
  }

  // ======================================================== castling
  function castling() {
    console.log("Analysis CASTLING");
    if ($chessboard.lastMove !== undefined) {
      let lastMovedPiece = $chessboard.lastMove.toSquare.piece;
      reduceCastlingArray($chessboard.lastMove.fromSquare.at);
      $chessboard.doingCastling = false;
      if (lastMovedPiece.isKing) {
        let { fromSquare, toSquare } = $chessboard.lastMove;
        const __SHORTCASTLING__ = "O-O";
        const __LONGCASTLING__ = "O-O-O";
        const /* function */ moveRook = (from, to, castlingLongShort) => {
            $chessboard.doingCastling = castlingLongShort;
            movePiece(getPiece(getSquare(from)), to);
          };
        if (fromSquare.at == CHESS.__SQUARE_WHITE_KING_START__) {
          if (toSquare.at == "c1") moveRook("a1", "d1", __LONGCASTLING__);
          else if (toSquare.at == "g1") moveRook("h1", "f1", __SHORTCASTLING__);
        } else if (fromSquare.at == CHESS.__SQUARE_BLACK_KING_START__) {
          if (toSquare.at == "c8") moveRook("a8", "d8", __LONGCASTLING__);
          else if (toSquare.at == "g8") moveRook("h8", "f8", __SHORTCASTLING__);
        }
        log("castling", $chessboard.doingCastling ? "TRUE" : "FALSE");
      }
    }
  }
  // ======================================================== analyzeWholeBoard
  function analyzeWholeBoard() {
    calculateBoard();
    const player = $chessboard.player;
    staleMate(player);
    checkMate(player);
  }

  // ======================================================== calculateBoard
  function calculateBoard() {
    $chessboard.clearAttributes();

    console.error("piece.potential(King)Moves");
    for (const square of $chessboard.squares) {
      let piece = getPiece(square);
      if (piece) {
        piece.potentialMoves();
      }
      if (piece.isKing) {
        piece.potentialKingMoves();
      }
    }

    // unhighlight
    for (let element of $chessboard.squares) {
      let chessSquare = $chessboard.getSquare(element);
      chessSquare.highlight(false);
    }
  }

  // ======================================================== enPassantPosition
  function enPassantPosition() {
    console.log("Analysis ENPASSANT");
    if ($chessboard.lastMove) {
      const { chessPiece, fromSquare, toSquare } = $chessboard.lastMove;
      if (chessPiece.isPawn && fromSquare.rankDistance(toSquare) == 2) {
        let position = fromSquare.file + (chessPiece.isWhite ? "3" : "6"); // file+3 OF file+6
        $chessboard.enPassantPosition = position; // Was er een en passant square van een pion?
        return position;
      } else {
        $chessboard.enPassantPosition = "-";
      }
    }
  }
  // ======================================================== reduceCastlingArray
  function reduceCastlingArray(lastReduceMove) {
    const cleanCastlingArray = (castlingFEN) => ($chessboard.castlingArray = $chessboard.castlingArray.filter((item) => item !== castlingFEN));

    if (lastReduceMove == "e1") {
      cleanCastlingArray("Q");
      cleanCastlingArray("K");
    } else if (lastReduceMove == "e8") {
      cleanCastlingArray("q");
      cleanCastlingArray("k");
    } else if (lastReduceMove == "a1") {
      cleanCastlingArray("Q");
    } else if (lastReduceMove == "h1") {
      cleanCastlingArray("K");
    } else if (lastReduceMove == "a8") {
      cleanCastlingArray("q");
    } else if (lastReduceMove == "h8") {
      cleanCastlingArray("k");
    }
  }
  // ======================================================== isValidGameBoard
  function isValidGameBoard() {
    const _kingSquare = /* function */ (color) => kingSquare(color); // get king, but without warning
    const whiteKing = _kingSquare(CHESS.__PLAYER_WHITE__);
    const blackKing = _kingSquare(CHESS.__PLAYER_BLACK__);
    return whiteKing && blackKing;
  }

  // ======================================================== isInCheck
  function isInCheck(color) {
    if (isValidGameBoard()) {
      // make sure there are pieces on the board
      const _kingSquare = kingSquare(color);
      if (_kingSquare && _kingSquare.isAttacked) {
        //! don't display message for miniboard
        log(color, "koning staat schaak door", _kingSquare.attackers);
        $chessboard.setMessage("Je staat schaak.");
        return true;
      }
      return false;
    }
  }
  // ======================================================== findSquaresBetween
  function findSquaresBetween(attackingPieceSquare, kingSquare) {
    const files = $chessboard.files;
    const getNum = /* function */ (value) => {
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
    if (isValidGameBoard()) {
      const horse = (color) => color + "-" + CHESS.__PIECE_KNIGHT__;
      const _kingSquare = kingSquare(color);
      if (_kingSquare && _kingSquare.isAttacked) {
        if (_kingSquare.attackers.length == 1) {
          const attackingPiece = /* function */ () => getPiece(_kingSquare.attackers[0].substring(1, 3));
          //console.log(attackingPiece(color));
          const attackingPieceSquare = /* function */ (color) => attackingPiece(color).square;
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
              const files = $chessboard.files;
              const fileDifference = Math.abs(files.indexOf(attackingPieceSquare(color).file) - files.indexOf(_kingSquare.file));
              const rankDifference = Math.abs(attackingPieceSquare(color).rank - _kingSquare.rank);
              if (fileDifference >= 2 || rankDifference >= 2) {
                // 4. Left with Bishop and Rook moves.
                // 5. findSquaresBetween horizontally, vertically or diagonally.
                const squaresBetween = findSquaresBetween(attackingPieceSquare(color), _kingSquare);
                // 6. defendedby lower or upper. Alleen (color)-stukken en niet de koning en intervenedByPawn.
                return squaresBetween.filter(/* function */ (element) => getSquare(element).isMovesFrom(color)).length;
              }
            } else {
              log("Horse, so no squares between calculation.");
            }
          }
        }

        if (getPiece(_kingSquare).moves.length >= 1) {
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
    const checkCanBeNegated = negatingCheck(color);
    if (isCheck && !getPiece(kingSquare(color)).moves.length) {
      if (checkCanBeNegated) {
        log("You can get out of check.");
      } else {
        log("Checkmate", `${CHESS.otherPlayer(color)}`);
        gameOver("Checkmate", color);
      }
    }
  }
  // ======================================================== noOtherMoves
  function noOtherMoves() {
    for (const square of $chessboard.squares) {
      let piece = getPiece(square);
      if (piece) {
        if (piece.color == $chessboard.player) {
          if (piece.moves.length) return false;
        }
      }
    }
    for (let element of $chessboard.squares) {
      let chessSquare = $chessboard.getSquare(element);
      chessSquare.highlight(false);
    }
    return true;
  }
  // ======================================================== staleMate
  function staleMate(color) {
    if (isValidGameBoard()) {
      const _kingSquare = kingSquare(color);
      if (_kingSquare) {
        const kingPiece = getPiece(_kingSquare);
        const isCheck = isInCheck(color);
        console.assert(kingPiece.moves, "Kingpiece moves not defined");
        const kingHasNoMoves = kingPiece.moves.length == 0;
        const kinghasFalseMoves = kingPiece.falseMoves.length > 0;
        if (!isCheck && noOtherMoves() && kingHasNoMoves && kinghasFalseMoves) {
          log("Stalemate!");
          gameOver("Stalemate", color);
        }
        const allWhitePiecesTaken = $chessboard.capturedWhitePieces.length == 15;
        const allBlackPiecesTaken = $chessboard.capturedBlackPieces.length == 15;
        if (allWhitePiecesTaken && allBlackPiecesTaken) {
          log("Stalemate!");
          gameOver("Stalemate", color);
        }
      }
    }
  }

  // ======================================================== gameOver
  function gameOver(mate, color) {
    if (mate == "Checkmate") {
      $chessboard.setMessage(`Game over. ${CHESS.otherPlayer(color)} heeft gewonnen.`);
      $chessboard.classList.add("game_over");
      setTimeout(endOfGame, 3000);
    } else if (mate == "Stalemate") {
      $chessboard.setMessage("Game over. Gelijkspel.");
      $chessboard.classList.add("game_over");
      setTimeout(endOfGame, 3000);
    }
  }

  // ======================================================== endOfGame
  function endOfGame() {
    let answer = prompt("Do you want to play another game? (y/n)");
    if (answer === "y") document.dispatchEvent(new Event("newGame", p1, p2));
    // Make it so the players are connected to the new match_guid. REDIRECT.
  }
};
