!(function () {
  /*************************************************************************
   <chess-board fen="" player="wit"> Web Component
   */
  customElements.define(
    CHESS.__WC_CHESS_BOARD__,
    class extends CHESS.ChessBaseElement {
      // ======================================================== <chess-board>.observedAttributes
      static get observedAttributes() {
        return [CHESS.__WC_ATTRIBUTE_FEN__];
      }
      // ======================================================== <chess-board>.constructor
      constructor() {
        super();
        // TODO: Looks like a bug, every piece moved ends up in this array
        this.capturedBlackPieces = [];
        this.capturedWhitePieces = [];
        this.chessMoves = [];
        this.doingCastling = false;
      }
      get localStorageGameID() {
        return this.database_id;
      }
      // ======================================================== <chess-board>.connectedCallback
      connectedCallback() {
        // when this Component is added to the DOM, create the board with FEN and Arrays.
        // <chess-square> and <chess-piece> are loaded ASYNC, so we need to wait for them to be defined before creating the board
        customElements.whenDefined(CHESS.__WC_CHESS_SQUARE__).then(() => {
          customElements.whenDefined(CHESS.__WC_CHESS_PIECE__).then(() => {
            const templateInHTML = this.getAttribute("template");
            const isMatchBoard = this.record;
            const hasFENAttribute = this.hasAttribute(CHESS.__WC_ATTRIBUTE_FEN__);
            const localFEN = localStorage.getItem(this.localStorageGameID);

            this.createboard(templateInHTML);

            if (isMatchBoard && localFEN) this.fen = localFEN;
            else if (hasFENAttribute) this.fen = this.getAttribute(CHESS.__WC_ATTRIBUTE_FEN__);
            else if (this._savedfen) this.fen = this._savedfen;
            else this.fen = undefined; // use default all pieces start board

            this.initPlayerTurn();

            CHESS.analysis(this, "start");
          });
        });
      }
      // ======================================================== <chess-board>.attributeChangedCallback
      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue && name == CHESS.__WC_ATTRIBUTE_FEN__) {
          this.fen = newValue;
          // TODO: generic call:
          // this[name] = newValue;
          // should work as well, because a getter "fen" exists on this
        }
      }
      // ======================================================== <chess-board>.id
      get id() {
        return this.getAttribute("id") || "";
      }
      set id(v) {
        if (v) this.setAttribute("id", v);
        else this.removeAttribute("id");
      }
      // ======================================================== <chess-board>.database_id
      get database_id() {
        if (!this.hasAttribute("database_id")) {
          this.setAttribute("database_id", this.id + new Date() / 1);
        }
        return this.getAttribute("database_id");
      }
      // ======================================================== <chess-board>.queryBoard
      queryBoard(selector) {
        // this is so we are ready for future error checking and enhancements like retrieving pieces and squares
        return this.querySelector(selector);
      }
      // ======================================================== <chess-board>.createboard
      createboard(name) {
        let userHTMLpieces = this.innerHTML;
        this.innerHTML = ""; // delete all userPieces, we will put them in another layer later

        // use the <template id=" [name] "> from the HTML document
        let templ = document.querySelector(`template[id="${name}"]`);
        if (templ) {
          this.append(templ.content.cloneNode(true));
        } else {
          this.innerHTML = CHESS.chessboard_innerHTML;
        }

        // instead of 'const' store the variables on the <chess-board> so ALL code can use it (in 2022)
        this.files = CHESS.__FILES__; // ["a", "b", "c", "d", "e", "f", "g", "h"]; // Kolommen
        this.ranks = CHESS.__RANKS__.reverse(); // ["8", "7", "6", "5", "4", "3", "2", "1"]; // Rijen
        this.squares = [];

        let gridareasHTML = "";
        let chess_squaresHTML = "";
        let fieldColor = true; // alternate white/black colors, a8 is white

        for (var rank = 0; rank < this.ranks.length; rank++) {
          for (var file = 0; file < this.files.length; file++) {
            const square = this.files[file] + this.ranks[rank]; // "a8"
            this.squares.push(square);

            gridareasHTML += `[${CHESS.__WC_ATTRIBUTE_AT__}="${square}"] { grid-area: ${square} }`;

            let fieldClass = fieldColor ? CHESS.__CLASSNAME_WHITESQUARE__ : CHESS.__CLASSNAME_BLACKSQUARE__;
            chess_squaresHTML += `<${CHESS.__WC_CHESS_SQUARE__} class="${fieldClass}" ${CHESS.__WC_ATTRIBUTE_AT__}="${square}"></${CHESS.__WC_CHESS_SQUARE__}>`;
            if (file < 7) fieldColor = !fieldColor; // alternate fieldColor white/black/white/black
          }
        }

        // the whole application works with the 1,2,3,4,5,6,7,8 Array
        this.ranks1to8 = this.ranks.reverse();

        this.queryBoard("#chessboard_gridareas").innerHTML = gridareasHTML;
        this.queryBoard("#chessboard_squares").innerHTML = chess_squaresHTML;
        this.queryBoard("#chessboard_pieces").innerHTML = userHTMLpieces;

        this.labels = this.hasAttribute("labels");
      }
      // ======================================================== <chess-board>.labels
      set labels(on = false) {
        // turn A1 - H8 labels on and off
        setTimeout(() => {
          //on document.createElement there is no element yet
          //if (this.isConnected)
          this.querySelector("#squarelabels").disabled = !on;
        });
      }
      // ======================================================== <chess-board>.disabled
      // TODO use disabled to not calculate board
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(on = false) {
        // turn A1 - H8 labels on and off
        setTimeout(() => {
          //on document.createElement there is no element yet
          //if (this.isConnected)
          this.toggleAttribute("disabled", on);
        });
      }
      // ======================================================== setMessage
      setMessage(msg) {
        console.warn("setMessage", msg);
        document.getElementById("message").innerText = msg;
      }
      // ======================================================== <chess-board>.getSquare
      getSquare(square) {
        // square can be "c5" OR a reference to <chess-square at="c5">
        // return reference to <chess-square at=" [position] ">
        if (square) {
          let squareElement = square;
          if (isString(square)) squareElement = this.queryBoard(`[${CHESS.__WC_ATTRIBUTE_AT__}="${square}"]`);
          if (!squareElement) console.warn(square, "is not a valid square");
          return squareElement;
        }
      }
      // ======================================================== <chess-board>.hasSquare
      hasSquare(square) {
        return this.squares.includes(square);
      }
      // ======================================================== <chess-board>.getPiece
      getPiece(square) {
        const squareElement = this.getSquare(square);
        if (squareElement) return squareElement.piece;
      }
      // ======================================================== <chess-board>.addPiece
      addPiece(name, at) {
        //if piecename is one FEN letter
        if (name && at) {
          name = CHESS.convertFEN(name);
          return this.getSquare(at).addPiece(name);
        }
      }
      // ======================================================== <chess-board>.clearAttributes
      clearAttributes() {
        for (const square of this.squares) {
          this.getSquare(square).clearAttributes();
        }
      }
      // ======================================================== <chess-board>.clear
      clear() {
        for (const square of this.squares) {
          this.getSquare(square).clear();
        }
      }
      // ======================================================== <chess-board>.restart
      restart() {
        this.clear();
        this.fen = undefined; // force start position
        this.initPlayerTurn();
      }
      // ======================================================== <chess-board>.initPlayerTurn
      initPlayerTurn() {
        delete this.pieceClicked;
        this.initAnalysis();
        for (let element of this.squares) {
          let chessSquare = this.getSquare(element);
          chessSquare.highlight(false);
        }
      }
      // ======================================================== <chess-board>.changePlayer
      changePlayer() {
        this.player = CHESS.otherPlayer(this.player); // todo Naar FEN
        this.initPlayerTurn();
      }
      // ======================================================== <chess-board>.recordMoveInDatabase
      recordMoveInDatabase({
        fromSquare, // <chess-square> from which piece was moved
        toSquare, // <chess-square> to which piece was moved
        move, // e2-e4  d7xh8  O-O-O
      }) {
        if (this.record) {
          console.warn("recordMoveInDatabase:", fromSquare.at, toSquare.at, move);
          // emit Event to <chess-match> which records all moves in database
          document.dispatchEvent(
            new CustomEvent(CHESS.__STORECHESSMOVE__, {
              bubbles: true,
              composed: true,
              cancelable: false,
              detail: {
                chessboard: this, // chessboard.record TRUE/FALSE if the move will be recorded
                move,
                fromsquare: fromSquare.at,
                tosquare: toSquare.at,
                fen: this.fen,
              },
            })
          );
        }
      }
      // ======================================================== <chess-board>.movePiece
      movePiece(chessPiece, square, animated = true) {
        if (isString(chessPiece)) chessPiece = this.getPiece(chessPiece); // convert "e2" to chessPiece IN e2
        const /* function */ movedPiece = () => {
            let fromSquare = chessPiece.square;
            let toSquare = this.getSquare(square);
            const lastFEN = this.fen;

            toSquare.pieceName = chessPiece.is; // REQUIRED?
            if (this.lastMove && toSquare.at == this.enPassantPosition && chessPiece.isPawn) {
              console.log("We had En Passant. Clear piece.");
              this.lastMove.toSquare.clear();
            }

            toSquare.addPiece(chessPiece);
            fromSquare.clear();
            chessPiece.animateFinished(); // do <chess-piece> CSS stuff after animation finished

            const /* function */ save2chessMoves = () => {
                this.chessMoves.push({
                  chessPiece,
                  fromSquare,
                  toSquare,
                  fen: lastFEN,
                });
              };
            save2chessMoves(); // save every move, including castling king AND rook

            if (CHESS.analysis && !this.doingCastling) {
              CHESS.analysis(this, CHESS.__ANALYSIS_ENPASSANT__);
              CHESS.analysis(this, CHESS.__ANALYSIS_CASTLING__); // this.doingCastling = "O-O" "O-O-O"
              CHESS.analysis(this, CHESS.__ANALYSIS_PROMOTION__);
            }
            if (this.doingCastling) {
              if (chessPiece.isKing) {
                this.recordMoveInDatabase({
                  fromSquare,
                  toSquare,
                  move: this.doingCastling, //record castling type "O-O"  "O-O-O"
                });
              } else {
                // Rook in castling mode
                this.chessMoves.pop(); // delete rook move
                let savedFEN = this.lastMove.fen;
                this.chessMoves.pop(); // delete king move
                save2chessMoves(); // save castling move
                this.lastMove.fen = savedFEN;

                // fen corrigeren

                this.doingCastling = false;
                this.changePlayer();
              }
            } else {
              // regular move
              this.recordMoveInDatabase({
                fromSquare,
                toSquare,
                move: fromSquare.at + (toSquare.piece ? CHESS.__MOVETYPE_CAPTURE__ : CHESS.__MOVETYPE_MOVE__) + toSquare.at, // O-O-O
              });
              this.changePlayer();
            }

            this.play(); // play all moves left in the queue
            return chessPiece;
          }; // end movedPiece function

        if (animated) chessPiece.animateTo(square).then(movedPiece);
        else movedPiece();
        this.setMessage("");
      }
      // ======================================================== <chess-board>.initAnalysis
      // initAnalysis wordt aangeroepen in einde Click-event.
      initAnalysis() {
        // console.error("initAnalysis");
        if (CHESS.analysis) {
          CHESS.analysis(this);
          CHESS.analysis(this, CHESS.__ANALYSIS_ENPASSANT__);
          CHESS.analysis(this, CHESS.__ANALYSIS_CASTLING__);
          CHESS.analysis(this, CHESS.__ANALYSIS_PROMOTION__);
        }
      }
      // ======================================================== <chess-board>.lastMove
      get lastMove() {
        if (this.chessMoves && this.chessMoves.length) {
          return this.chessMoves.slice(-1)[0];
        }
      }
      // ======================================================== <chess-board>.undoMove
      undoMove() {
        if (this.lastMove) this.fen = this.lastMove.fen;
        this.chessMoves.pop();
      }
      // ======================================================== <chess-board>.findPieceSquare
      findPieceSquare(piece) {
        if (isString(piece)) {
          const selector = CHESS.__WC_CHESS_SQUARE__ + `[${CHESS.__WC_ATTRIBUTE_PIECENAME__}="${piece}"]`;
          return this.querySelector(selector);
        } else {
          return piece.square; // <chess-piece>.square getter
        }
      }
      // ======================================================== <chess-board>.kingSquare
      kingSquare(
        color = this.getAttribute(__WC_ATTRIBUTE_PLAYER__), // get default color from <chess-board player="..."
        showwarning = false,
        warning = /* function */ () => console.warn("No king on the board!") // optional warning function
      ) {
        if (color == "wit") color = CHESS.__PLAYER_WHITE__;
        if (color == "zwart") color = CHESS.__PLAYER_BLACK__;
        const king = color + CHESS.__PIECE_SEPARATOR__ + CHESS.__PIECE_KING__;
        const square = this.findPieceSquare(king);
        return square || (showwarning && warning());
      }
      // ======================================================== <chess-board>.kingAttackers
      kingAttackers(color) {
        return this.kingSquare(color).attackers;
      }
      // ======================================================== <chess-board>.documentation
      documentation() {
        // documentatie van class Methods en Properties in console.log
        this.docs(this);
        this.docs(this.querySelector(CHESS.__WC_CHESS_SQUARE__));
        this.docs(this.querySelector(CHESS.__WC_CHESS_PIECE__));
      }
      // ======================================================== <chess-board>.fen SETTER/GETTER
      set fen(fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -") {
        // TODO: Waarom hier?? Omdat er altijd een castlingArray moet zijn als je een fen op het bord zet.
        console.log("%c set fen: ","background:orange", fenString);
        this.castlingArray = [CHESS.__FEN_WHITE_KING__, CHESS.__FEN_WHITE_QUEEN__, CHESS.__FEN_BLACK_KING__, CHESS.__FEN_BLACK_QUEEN__]; // Halen we uit FEN

        //! THIS WILL TRIGGER set fen again: this.setAttribute(CHESS.__WC_ATTRIBUTE_FEN__, fenString);
        // make sure we don't run before the board exists, because attributeChangedCallback runs early
        if (this.squares) {
          this.clear();
          if (fenString !== "") {
            let [fen, player, castling, enpassant, halfmove, fullmove] = fenString.split(" ");
            let squareIndex = 0;
            // fen
            fen.split("").forEach((fenLetter) => {
              if (fenLetter !== "/") {
                if (parseInt(fenLetter) > 0 && parseInt(fenLetter) < 9) {
                  // Als het 1 t/m 8 is...
                  squareIndex = squareIndex + Number(fenLetter);
                } else {
                  this.addPiece(fenLetter, this.squares[squareIndex]);
                  squareIndex++;
                }
              }
            });
            // player
            if (player) {
              if (player == "b") {
                this.setAttribute(CHESS.__WC_ATTRIBUTE_PLAYER__, "zwart");
              } else {
                this.setAttribute(CHESS.__WC_ATTRIBUTE_PLAYER__, "wit");
              }
            }
            // castling "KQkq" becomes this.castlingArray = ["K", "Q", "k", "q"]
            if (castling && castling !== "-") this.castlingArray = castling.split("");
            // enpassant
            if (enpassant && enpassant !== "-") this.enPassantPosition = enpassant;
          }
          if (document.querySelector("#fen")) document.querySelector("#fen").value = fenString;
          delete this._savedfen;
        } else {
          // when the constructor runs on document.createElement, the squares are not set yet.
          this._savedfen = fenString;
        }
        this.classList.remove("game_over");

        // only analyze the board when there are squares on the board.
        setTimeout(() => {
          if (this._savedfen) this.fen = this._savedfen;
          if (this.getSquare("e3")) CHESS.analysis(this, "start");
        });
      } // set fen
      // ======================================================== <chess-board>.fen SETTER/GETTER
      get fen() {
        // fenString (The whole fenString)
        let fenString = "";
        let fenParts = [];
        let emptySquareCount = 0;
        // fen
        let fen = "";
        if (this.files) {
          for (var rank = 7; rank >= 0; rank--) {
            for (var file = 0; file < this.files.length; file++) {
              const square = this.files[file] + this.ranks[rank]; // "a8"
              const piece = this.getPiece(square);
              if (piece) {
                const fenPiece = CHESS.convertFEN(piece.is);
                if (emptySquareCount != 0) {
                  fen = fen + emptySquareCount;
                  emptySquareCount = 0;
                }
                fen = fen + fenPiece;
              } else {
                emptySquareCount++;
              }
            }
            if (rank < 8) {
              if (emptySquareCount != 0) {
                fen = fen + emptySquareCount;
                emptySquareCount = 0;
              }
              if (rank > 0) fen = fen + "/";
            }
          }
        } //end if
        fenParts.push(fen);
        // player
        let player = "-";
        if (this.getAttribute(CHESS.__WC_ATTRIBUTE_PLAYER__) == CHESS.__PLAYER_BLACK__) {
          player = "b";
        } else {
          player = "w";
        }
        fenParts.push(player);
        // castling
        let castling = "";
        if (this.castlingArray.length) castling = this.castlingArray.join("");
        else castling = "-";
        fenParts.push(castling);
        // enpassant
        //todo fix enpassant to remove after 1 turn.
        let enpassant = "-";
        if (this.enPassantPosition) enpassant = this.enPassantPosition;
        fenParts.push(enpassant);
        // join
        fenString = fenParts.join(" ");
        return fenString;
      } // get fen()
      // ======================================================== <chess-board>.record GETTER
      get record() {
        return this.hasAttribute(CHESS.__WC_ATTRIBUTE_RECORD__);
      }
      // ======================================================== <chess-board>.play
      play(moves = this._moves) {
        // chessboard.play([["e2", "e4"], ["e7", "e5"], ["g1", "f3"], ["b8", "c6"]]);
        // TODO: rewrite to ["e2-e4", "e7-e5", "g1-f3", "b8-c6"] so "x" take piece can be used
        if (!this._moves) this._moves = moves || console.warn("No play moves");
        if (this._moves && this._moves.length) {
          let [from, to] = this._moves.shift();
          let simulateClicks = false; // TODO: make simulateClicks work
          if (simulateClicks) {
            this.getSquare(from).handleFirstClick();
            setTimeout(() => {
              this.getSquare(to).handleSecondClick();
              this.play();
            }, 1500);
          } else {
            this.movePiece(from, to);
          }
        }
      }
      adddplaymove(from, to) {
        this._moves.unshift([from, to]);
      }
      // ======================================================== <chess-board>.player
      get player() {
        return this.getAttribute(CHESS.__WC_ATTRIBUTE_PLAYER__);
      }
      set player(v) {
        return this.setAttribute(CHESS.__WC_ATTRIBUTE_PLAYER__, v);
      }
      updateFENonScreen() {
        let fenElement = document.getElementById("fen");
        if (fenElement) fenElement.value = this.fen;
      }
      saveFENinLocalStorage() {
        console.log("localStorage", this.fen);
        localStorage.setItem(this.localStorageGameID, this.fen);
      }
    } // class ChessBoard
  ); // end of class definition

  // ********************************************************** end IIFE
})();
