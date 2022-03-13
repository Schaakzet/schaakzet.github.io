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
      }
      // ======================================================== <chess-board>.connectedCallback
      connectedCallback() {
        // <ches-square> and <chess-piece> are loaded ASYNC, so we need to wait for them to be defined before creating the board
        customElements.whenDefined(CHESS.__WC_CHESS_SQUARE__).then(() => {
          customElements.whenDefined(CHESS.__WC_CHESS_PIECE__).then(() => {
            // when this Component is added to the DOM, create the board with FEN and Arrays.
            this.createboard(this.getAttribute("template")); // id="Rob2"
            if (this.hasAttribute(CHESS.__WC_ATTRIBUTE_FEN__)) this.fen = this.getAttribute(CHESS.__WC_ATTRIBUTE_FEN__);
            if (this._savedfen) this.fen = this._savedfen;
            this.initPlayerTurn();
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
        this.calculateBoard();
        for (let element of this.squares) {
          let chessSquare = this.getSquare(element);
          chessSquare.highlight(false);
        }
      }
      // ======================================================== <chess-board>.changePlayer
      changePlayer(piece = this.pieceClicked) {
        this.player = CHESS.otherPlayer(this.player); // todo Naar FEN
        this.initPlayerTurn();
      }
      // ======================================================== <chess-board>.recordMove
      recordMove({
        chessPiece, // <chess-piece> moved
        fromSquare, // <chess-square> from which piece was moved
        toSquare, // <chess-square> to which piece was moved
        capturedPiece = false, // <chess-piece> captured
      }) {
        let moveType = capturedPiece ? CHESS.__MOVETYPE_CAPTURE__ : CHESS.__MOVETYPE_MOVE__;
        console.warn("recordMove:", chessPiece.is, fromSquare.at, moveType, toSquare.at);
        this.chessMoves.push({
          chessPiece,
          fromSquare,
          toSquare,
          fen: this.fen,
        });
        // emit Event to <chess-match> which records all moves in database
        document.dispatchEvent(
          new CustomEvent(CHESS.__STORECHESSMOVE__, {
            bubbles: true,
            composed: true,
            cancelable: false,
            detail: {
              chessboard: this,
              moves: this.chessMoves,
              chessPiece,
              fromSquare,
              toSquare,
              moveType,
              // data send to API
              move: fromSquare.at + moveType + toSquare.at,
              fromsquare: fromSquare.at,
              tosquare: toSquare.at,
              fen: this.fen,
            },
          })
        );
      }
      // ======================================================== <chess-board>.movePiece
      movePiece(chessPiece, square) {
        if (isString(chessPiece)) chessPiece = this.getPiece(chessPiece); // convert "e2" to chessPiece IN e2
        const movedPiece = () => {
          let { is: pieceName, square: fromSquare } = chessPiece;
          let toSquare = this.getSquare(square);

          // TODO: is the next line required?
          //if (fromSquare) fromSquare.clear(); // if the piece is already on a square, remove it from that square

          toSquare.pieceName = pieceName;
          if (this.lastMove) {
            if (toSquare.at == this.lastMove.enPassantPosition && chessPiece.isPawn) {
              console.log("We had En Passant. Clear piece.");
              this.lastMove.toSquare.clear();
            }
          }

          //!let testsquare = this.chessboard.getSquare("e3");
          //! (tech!) chessPiece DOM verplaatsen, daarna fromSquare leeg maken
          //! het werkt wel andersom; maar eens verder testen
          let capturedPiece = toSquare.piece;
          toSquare.addPiece(chessPiece);
          fromSquare.clear();
          this.recordMove({ chessPiece, fromSquare, toSquare, capturedPiece });
          //!console.error("state", testsquare.piece, chessPiece);

          chessPiece.animateFinished();

          this.calculateBoardAfterMove(chessPiece);

          this.chessboard.save();
          this.chessboard.play();
          return chessPiece;
        };
        if (0) movedPiece();
        else chessPiece.animateTo(square).then(movedPiece);
      }
      // ======================================================== <chess-board>.calculateBoard
      // calculateBoard wordt aangeroepen in einde Click-event.
      calculateBoard() {
        if (CHESS.analysis) CHESS.analysis(this);
      }
      calculateBoardAfterMove() {
        if (CHESS.analysis) {
          CHESS.analysis(this, CHESS.__ANALYSIS_ENPASSANT__);
          CHESS.analysis(this, CHESS.__ANALYSIS_CASTLING__);
          CHESS.analysis(this, CHESS.__ANALYSIS_PROMOTION__);
          //if (!doneCastlingMove) this.changePlayer();
        }
      }
      // ======================================================== <chess-board>.lastMove
      get lastMove() {
        if (this.chessMoves && this.chessMoves.length) {
          return this.chessMoves.slice(-1)[0];
        }
      }
      // ======================================================== <chess-board>.undoLastMove
      undoLastMove() {
        console.log(this.chessMoves);
        let fenString = this.chessMoves.pop().fen;
        // if (rocade) setFEN (obj, 2nd last fenString)
        // setFEN (obj, last fenString)
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
        warning = () => console.warn("No king on the board!") // optional warning function
      ) {
        if (color == "white") color = CHESS.__PLAYER_WHITE__;
        if (color == "black") color = CHESS.__PLAYER_BLACK__;
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
      set fen(fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {
        // TODO: Waarom hier?? Reset?
        this.castlingArray = [CHESS.__FEN_WHITE_KING__, CHESS.__FEN_WHITE_QUEEN__, CHESS.__FEN_BLACK_KING__, CHESS.__FEN_BLACK_QUEEN__]; // Halen we uit FEN

        //! THIS WILL TRIGGER set fen again: this.setAttribute(CHESS.__WC_ATTRIBUTE_FEN__, fenString);
        // make sure we don't run before the board exists, because attributeChangedCallback runs early
        if (this.squares) {
          this.clear();
          if (fenString !== "") {
            let squareIndex = 0;
            fenString.split("").forEach((piece) => {
              if (piece !== "/") {
                if (parseInt(piece) > 0 && parseInt(piece) < 9) {
                  // Als het 1 t/m 8 is...
                  squareIndex = squareIndex + Number(piece);
                } else {
                  this.addPiece(piece, this.squares[squareIndex]);
                  squareIndex++;
                }
              }
            });
          }
          if (document.querySelector("#fen")) document.querySelector("#fen").value = fenString;

          delete this._savedfen;
        } else {
          // when the constructor runs on document.createElement, the squares are not set yet
          this._savedfen = fenString;
        }
        // this.calculateBoard(); breaks code
      } // set fen
      // ======================================================== <chess-board>.fen SETTER/GETTER
      get fen() {
        let fenString = "";
        let emptySquareCount = 0;
        for (var rank = 7; rank >= 0; rank--) {
          for (var file = 0; file < this.files.length; file++) {
            const square = this.files[file] + this.ranks[rank]; // "a8"
            const piece = this.getPiece(square);
            if (piece) {
              const fenPiece = CHESS.convertFEN(piece.is);
              if (emptySquareCount != 0) {
                fenString = fenString + emptySquareCount;
                emptySquareCount = 0;
              }
              fenString = fenString + fenPiece;
            } else {
              emptySquareCount++;
            }
          }
          if (rank < 8) {
            if (emptySquareCount != 0) {
              fenString = fenString + emptySquareCount;
              emptySquareCount = 0;
            }
            if (rank > 0) fenString = fenString + "/";
          }
        }
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
      // ======================================================== <chess-board>.save
      save() {
        localStorage.setItem("fen", this.fen);
        let fenElement = document.getElementById("fen");
        if (fenElement) fenElement.value = this.fen;
      }
    } // class ChessBoard
  ); // end of class definition

  // ********************************************************** end IIFE
})();
