// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  const HTML_ImageChessPiece = (name) => `<img src="https://schaakzet.github.io/img/${name}.png">`;

  // ********************************************************** <chess-piece is="wit-paard" at="D5"> Web Component
  customElements.define(
    CHESS.__WC_CHESS_PIECE__,
    class extends CHESS.ChessBaseElement {
      // ======================================================== <chess-piece>.observedAttributes
      static get observedAttributes() {
        return [CHESS.__WC_ATTRIBUTE_IS__]; // listen to is attribute
      }
      // ======================================================== <chess-piece>.attributeChangedCallback
      attributeChangedCallback(name, oldValue, newValue) {
        // if is attribute changed, render new image
        this.innerHTML = HTML_ImageChessPiece(newValue);
      }
      // ======================================================== <chess-piece>.movePiece
      movePieceTo(at) {
        this.chessboard.movePiece(this, at);
      }
      // ======================================================== <chess-piece>.is
      get is() {
        return this.getAttribute(CHESS.__WC_ATTRIBUTE_IS__);
      }
      set is(value) {
        this.setAttribute(CHESS.__WC_ATTRIBUTE_IS__, value);
      }
      // ======================================================== <chess-piece>.pieceName
      get pieceName() {
        return this.is;
      }
      // ======================================================== <chess-piece>.fen_at
      get fen_at() {
        return CHESS.convertFEN(this.is) + this.at
      }
      // ======================================================== <chess-piece>.color
      get color() {
        const indexStreepje = this.is.indexOf(CHESS.__PIECE_SEPARATOR__);
        return this.is.slice(0, indexStreepje);
      }
      // ======================================================== <chess-piece>.isWhite
      get isWhite() {
        return this.color == CHESS.__PLAYER_WHITE__;
      }
      // ======================================================== <chess-piece>.isBlack
      get isBlack() {
        return this.color == CHESS.__PLAYER_BLACK__;
      }
      // ======================================================== <chess-piece>.isPawn
      get isPawn() {
        return this.isPiece(CHESS.__PIECE_PAWN__);
      }
      // ======================================================== <chess-piece>.isWhitePawn
      get isWhitePawn() {
        return this.is == CHESS.__PLAYER_WHITE__ + CHESS.__PIECE_SEPARATOR__ + CHESS.__PIECE_PAWN__;
      }
      // ======================================================== <chess-piece>.isWhitePawn
      get isBlackPawn() {
        return this.is == CHESS.__PLAYER_BLACK__ + CHESS.__PIECE_SEPARATOR__ + CHESS.__PIECE_PAWN__;
      }
      // ======================================================== <chess-piece>.isPiece
      isPiece(name) {
        return this.is.endsWith(name);
      }
      // ======================================================== <chess-piece>.isRook
      get isRook() {
        return this.isPiece(CHESS.__PIECE_ROOK__);
      }
      // ======================================================== <chess-piece>.isKnight
      get isKnight() {
        return this.isPiece(CHESS.__PIECE_KNIGHT__);
      }
      // ======================================================== <chess-piece>.isBishop
      get isBishop() {
        return this.isPiece(CHESS.__PIECE_BISHOP__);
      }
      // ======================================================== <chess-piece>.isKing
      get isKing() {
        return this.isPiece(CHESS.__PIECE_KING__);
      }
      // ======================================================== <chess-piece>.isQueen
      get isQueen() {
        return this.isPiece(CHESS.__PIECE_QUEEN__);
      }
      // ======================================================== <chess-piece>.atStartRow
      get atStartRow() {
        return (this.isBlackPawn && this.atRank(7)) || (this.isWhitePawn && this.atRank(2));
      }
      // ======================================================== <chess-piece>.isPawnAtEnd
      get isPawnAtEnd() {
        return this.isPawn && (this.atRank(8) || this.atRank(1));
      }
      // ======================================================== <chess-piece>.pieceMoves
      get pieceMoves() {
        let _moves = [];
        if (this.isKnight) {
          _moves = CHESS.__HORSEMOVES__;
        } else if (this.isBishop) {
          _moves = CHESS.__BISHOPMOVES__;
        } else if (this.isRook) {
          _moves = CHESS.__ROOKMOVES__;
        } else if (this.isQueen) {
          _moves = CHESS.__QUEENMOVES__;
        } else if (this.isKing) {
          _moves = CHESS.__KINGMOVES__;
        } else if (this.isPawn) {
          if (this.isWhitePawn) {
            _moves = [[[0, 1]]];
            if (this.atStartRow) _moves[0].push([0, 2]);
          } else {
            _moves = [[[0, -1]]];
            if (this.atStartRow) _moves[0].push([0, -2]);
          }
        }
        return _moves;
      }
      // ======================================================== <chess-piece>.possibleMove
      possibleMove = (x_move = 0, y_move = 0) => {
        const { files, ranks1to8: ranks } = this.chessboard; // Object destructuring: reference ranks1to8 as "ranks"

        const fromSquare = this.at;
        const x = files.indexOf(fromSquare[0]);
        const y = ranks.indexOf(fromSquare[1]);
        const toFile = files[x + x_move];
        const toRank = ranks[y + y_move];
        // TODO: Shorter code, and move to translate in BaseClass at top of code
        // const [file, rank] = this.at;
        // const toFile = [files.indexOf(file) + x_move];
        // const toRank = [ranks.indexOf(rank) + y_move];

        // both need to be defined
        if (toFile && toRank) {
          return toFile + toRank; // example: "d5"
        } else {
          return false;
        }
      };
      // ======================================================== <chess-piece>.sameColorAsPiece
      sameColorAsPiece(piece) {
        // piece can be <chess-piece> or "black" or "white"
        return this.color == (isString(piece) ? piece : piece.color);
      }
      // ======================================================== <chess-piece>.potentialMoves
      potentialMoves() {
        //console.warn("potentialMoves", this.is);

        // De array potentialMovesArray is alle mogelijkheden van possibleMove.
        let _potentialMovesArray = [];
        let _pieceMoves = this.pieceMoves;
        for (let line = 0; line < _pieceMoves.length; line++) {
          for (let move = 0; move < _pieceMoves[line].length; move++) {
            let [xAxis, yAxis] = _pieceMoves[line][move]; // get x,y movement 0,1
            let _squareName = this.possibleMove(xAxis, yAxis); // TODO:: this.possibleMove(pieceMoves[line][move]) // pass Array
            if (_squareName) {
              const _squareElement = this.chessboard.getSquare(_squareName); // get <chess-square> element
              _squareElement.movesFrom(this);
              //Eerst kijken of er een piece staat, en dan kijken of het dezelfde kleur heeft.
              if (_squareElement.piece) {
                if (this.isPawn) {
                  // do nothing for Pawns
                } else if (this.sameColorAsPiece(_squareElement.piece)) {
                  _squareElement.highlight(CHESS.__PROTECT_PIECE__); // TODO:: move to .defendedBy() method
                  _squareElement.defendedBy(this);
                } else {
                  // not a pawn
                  // Als het een andere kleur heeft,CHESS.__ATTACK_PIECE__, potentialMove!
                  // attackedby="Nb6,Qf3"
                  _squareElement.highlight(CHESS.__ATTACK_PIECE__); // TODO:: move to .attackedBy() method
                  _squareElement.attackedBy(this);
                  _potentialMovesArray.push(_squareName);
                }
                // Deze break is er voor om niet stukken OVER een ander stuk nog te checken.
                // Als er geen piece op de squareElement staat. EMPTY.
                if (!_squareElement.piece.isKing) break;
              } else {
                _squareElement.highlight(CHESS.__EMPTY_SQUARE__);
                _potentialMovesArray.push(_squareName);
                if (!this.isPawn) {
                  _squareElement.defendedBy(this);
                }
              }
            } else {
              // move is outside board
            }
          } // for move
        } // for line

        // Schuin aanvallen van pion.
        const pawnAttack = (piececolor, x, y) => {
          const _squareName = this.square.translate(x, y); // "d6"
          const _squareElement = this.chessboard.getSquare(_squareName);
          // console.error("SN:", squareName, "SEL:", squareElement);
          if (_squareElement) {
            // Test of we binnen het bord zijn.
            if (_squareElement.piece) {
              if (_squareElement.piece.sameColorAsPiece(piececolor)) {
                _squareElement.highlight(CHESS.__ATTACK_PIECE__); // TODO:: move to .attackedBy() method
                _squareElement.attackedBy(this);
                _potentialMovesArray.push(_squareName);
              } else {
                _squareElement.highlight(CHESS.__PROTECT_PIECE__); // TODO:: move to .defendedBy() method
                _squareElement.defendedBy(this);
              }
            } else {
              // En passant
              if (this.chessboard.lastMove) {
                if (_squareName == this.chessboard.lastMove.enPassantPosition) {
                  _squareElement.highlight(CHESS.__ATTACK_PIECE__); // TODO:: move to .attackedBy() method
                  _squareElement.attackedBy(this);
                  _potentialMovesArray.push(_squareName);
                }
              }
              _squareElement.defendedBy(this);
            }
          }
        };

        if (this.pieceName === CHESS.__PIECE_WHITE_PAWN__) {
          pawnAttack(CHESS.__PLAYER_BLACK__, -1, 1);
          pawnAttack(CHESS.__PLAYER_BLACK__, 1, 1);
        } else if (this.pieceName === CHESS.__PIECE_BLACK_PAWN__) {
          pawnAttack(CHESS.__PLAYER_WHITE__, 1, -1);
          pawnAttack(CHESS.__PLAYER_WHITE__, -1, -1);
        }

        this.moves = _potentialMovesArray;
      } // potentialMoves
      // ======================================================== <chess-piece>.potentialKingMoves
      potentialKingMoves() {
        if (this.isKing) {
          // ROQUEREN
          const _potentialMovesArray = this.moves;
          // TODO: ?? gaat dit wel goed als er andere stukken staan?
          const longWhiteTower = this.chessboard.getPiece(CHESS.__SQUARE_BOTTOM_LEFT__);
          const shortWhiteTower = this.chessboard.getPiece(CHESS.__SQUARE_BOTTOM_RIGHT__);
          const longBlackTower = this.chessboard.getPiece(CHESS.__SQUARE_TOP_LEFT__);
          const shortBlackTower = this.chessboard.getPiece(CHESS.__SQUARE_TOP_RIGHT__);

          const playerColor = this.chessboard.player;
          // TODO: onderstaande kan vervangen voor door 4x aanroepen van 1 function(fenLetter,destinationSquare,offset,squareName)
          const castlingArray = this.chessboard.castlingArray;
          if (playerColor == CHESS.__PLAYER_WHITE__) {
            const longWhiteCastling = castlingArray.includes(CHESS.__FEN_WHITE_QUEEN__) && longWhiteTower.moves && longWhiteTower.moves.includes("d1");
            if (longWhiteCastling) {
              if (this.chessboard.castlingInterrupt(CHESS.__PLAYER_WHITE__, -3)) {
                const squareName = "c1";
                this.square.squareElement(squareName).highlight(CHESS.__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
            if (castlingArray.includes(CHESS.__FEN_WHITE_KING__) && shortWhiteTower.moves && shortWhiteTower.moves.includes("f1")) {
              if (this.chessboard.castlingInterrupt(CHESS.__PLAYER_WHITE__, 2)) {
                const squareName = "g1";
                this.square.squareElement(squareName).highlight(CHESS.__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
          } else if (playerColor == CHESS.__PLAYER_BLACK__) {
            if (castlingArray.includes(CHESS.__FEN_BLACK_QUEEN__) && longBlackTower.moves && longBlackTower.moves.includes("d8")) {
              if (this.chessboard.castlingInterrupt(CHESS.__PLAYER_BLACK__, -3)) {
                const squareName = "c8";
                this.square.squareElement(squareName).highlight(CHESS.__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
            if (castlingArray.includes(CHESS.__FEN_BLACK_KING__) && shortBlackTower.moves && shortBlackTower.moves.includes("f8")) {
              if (this.chessboard.castlingInterrupt(CHESS.__PLAYER_BLACK__, 2)) {
                const squareName = "g8";
                this.square.squareElement(squareName).highlight(CHESS.__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
          }
          this.moves = _potentialMovesArray;

          // ALLOWED MOVES
          const allowedMoves = _potentialMovesArray.filter((squareName) => {
            const defender_square = this.chessboard.getSquare(squareName);
            const ultimateDefenders = defender_square.defenders.filter((defender_FENat) => {
              let myFENpos = CHESS.convertFEN(this.is) + this.at;
              let defender = this.chessboard.getPiece(defender_FENat.substring(1, 3));
              // console.log(squareName, defender_FENat, defender_FENat == myFENpos, defender.color, playerColor);
              return defender_FENat !== myFENpos && defender.color !== playerColor;
            });
            return !ultimateDefenders.length;
          });
          // FALSE MOVES
          const falseMoves = this.moves.filter((potentialMove) => {
            return !allowedMoves.includes(potentialMove);
          });
          this.falseMoves = falseMoves; // Piece Koning krijgt een array falseMoves. Voor staleMate.
          // NEW DEFENDED ARRAY
          const kingPosition = CHESS.convertFEN(this.is) + this.at;

          for (const squarename of falseMoves) {
            const square = this.chessboard.getSquare(squarename);
            const defendedby = square.defenders;
            const newDefendedArray = defendedby.filter((defender) => {
              return defender != kingPosition;
            });
            square.setAttribute(CHESS.__WC_ATTRIBUTE_DEFENDEDBY__, newDefendedArray);
            square.style.border = "";
            // NEW ATTACKED ARRAY
            if (square.getAttribute(CHESS.__WC_ATTRIBUTE_ATTACKEDBY__)) {
              const attackedby = square.attackers;
              const newAttackedArray = attackedby.filter((attacker) => {
                return attacker != kingPosition;
              });
              square.setAttribute(CHESS.__WC_ATTRIBUTE_ATTACKEDBY__, newAttackedArray);
              square.style.border = "";
            }
          }
          this.moves = allowedMoves;
        }
      }
      // ======================================================== <chess-piece>.animateTo
      animateTo(destinationSquare) {
        let { top, left } = this.getBoundingClientRect();
        let { top: destTop, left: destLeft } = this.chessboard.getSquare(destinationSquare).getBoundingClientRect();
        this._savedposition = this.style.position;
        this.style.position = "absolute";
        return this.animate([{ transform: `translateX(0px) translateY(0px)` }, { transform: `translateX(${destLeft - left}px) translateY(${destTop - top}px)` }], {
          duration: CHESS.__MOVEPIECE_ANIMATION_DURATION__,
          iterations: 1,
        }).finished; // finished promise later calls animateFinished, so we keep all animation logic within this class
      }
      // ======================================================== <chess-piece>.animateTo
      animateFinished() {
        this.style.position = this._savedposition;
      }
    }
  );
})();
