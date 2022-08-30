!(function () {
  const __COMPONENT_NAME__ = CHESS.__WC_CHESS_BOARD__;
  // ********************************************************** logging

  // the amount of console.logs displayed in this component
  let logDetailComponent = 0; //! -1=no logs 0=use global setting >0=custom setting
  let logComponent = window.CHESS.log[__COMPONENT_NAME__];
  let logDetail = logDetailComponent || logComponent.detail;

  function log() {
    console.logColor &&
      console.logColor(
        {
          name: __COMPONENT_NAME__,
          background: "green",
          ...logComponent,
        },
        ...arguments
      );
  }
  // ********************************************************** class BoardMoves
  class BoardMoves extends Array {
    // ======================================================== BoardMoves.constructor
    constructor(...args) {
      super(...args);
    }
    //! push(move) DON'T USE THIS FUNCTION, USE addMove()
    // ======================================================== BoardMoves.addMove
    addMove(move) {
      this.push(move);
    }
    deleteLastMove() {
      return this.pop();
    }
    // ======================================================== BoardMoves.getMoves
    get lastMove() {
      return this.slice(-1)[0];
    }
  }

  /***********************************************************************/
  customElements.define(
    __COMPONENT_NAME__,
    class extends CHESS.ChessBaseSquarePieceElement {
      // ======================================================== <chess-board>.observedAttributes
      static get observedAttributes() {
        return [CHESS.__WC_ATTRIBUTE_FEN__];
      }
      // ======================================================== <chess-board>.constructor
      constructor() {
        super();
        this.capturedBlackPieces = [];
        this.capturedWhitePieces = [];
        this.chessMovesHistory = new BoardMoves();
        this.doingCastling = false;
      }

      // ======================================================== <chess-board>.isFreeplay
      isFreeplay() {
        return true;
      }
      // ======================================================== <chess-board>.doAnalysis
      get doAnalysis() {
        return this.hasAttribute(CHESS.__DO_BOARD_ANALYSIS__) || false; // default NO analysis
      }
      // ======================================================== <chess-board>.connectedCallback
      connectedCallback() {
        super.connectedCallback();
        // when this Component is added to the DOM, create the board with FEN and Arrays.
        // <chess-square> and <chess-piece> are loaded ASYNC, so we need to wait for them to be defined before creating the board
        customElements.whenDefined(CHESS.__WC_CHESS_SQUARE__).then(() => {
          customElements.whenDefined(CHESS.__WC_CHESS_PIECE__).then(() => {
            const templateInHTML = this.getAttribute("template");
            const isMatchBoard = this.record;
            const hasFENAttribute = this.hasAttribute(CHESS.__WC_ATTRIBUTE_FEN__);

            this.createboard(templateInHTML);

            // Define this.fen (set FEN)
            // if (hasFENAttribute) {
            //   this.fen = this.getAttribute(CHESS.__WC_ATTRIBUTE_FEN__);
            //   console.log("this.fen = FEN attribute");
            // } else if (this._savedfen) {
            //   this.fen = this._savedfen;
            //   console.log("this.fen = _savedfen");
            // } else {
            //   this.fen = undefined; // use default all pieces start board
            //   console.log("this.fen = undefined");
            // }

            window.addEventListener("resize", (e) => this.resizeCheck(e));
            if (this.id !== CHESS.__TESTBOARD_FOR_MOVES__) this.listenOnMatchID();

            // this.initPlayerTurn();

            //! chess-board is display:none, after resize make it display:block
            this.resizeCheck();
            setTimeout(() => {
              this.style.display = "block";
            }, 100);
          });
        });
      }
      // ======================================================== <chess-board>.windowResizeCheck
      resizeCheck(e) {
        setTimeout(() => {
          if (this.disabled) return; // do not resize mini boards

          let { top, bottom, height } = this.getBoundingClientRect();
          let bottomViewport = window.visualViewport.height;
          let widthViewport = window.visualViewport.width;
          let heightAdded = bottomViewport - bottom;
          //if (bottom > window.visualViewport.height)  = window.visualViewport.height;
          let newWidth = ~~(height + heightAdded);
          let newHeight = newWidth;

          let marginForTextMessage = 250; //! this forces a smaller board, was 50

          if (widthViewport < bottomViewport) {
            // portrait screen
            newWidth = widthViewport - marginForTextMessage;
          } else {
            // landscape screen
            newWidth = bottomViewport - marginForTextMessage;
            //console.warn("resize", top, bottom, newHeight, bottomViewport);
          }
          // make sure board doesn't drop below bottom of the screen
          newHeight = newWidth;
          while (top + newHeight > bottomViewport) {
            newWidth--;
            newHeight--;
          }

          this.style.setProperty("--chess_board_resized_width", newWidth + "px");
          this.style.setProperty("--chess_piece_resized_width", newWidth / 8 + "px");

          //! logic error here
          // the header of the page is loaded AFTER the board is resized,
          // so the board tries to take full width/height of the page.
          // and after that the header is displayed
          setTimeout(() => {
            // scroll chess-board into view, bottom at the bottom of the screen
            (this.parentNode || this).scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
          }, 500);
        }, 100);
      }
      // ======================================================== <chess-board>.attributeChangedCallback
      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue) {
          if (oldValue !== newValue && name == CHESS.__WC_ATTRIBUTE_FEN__) {
            log(this, "attributeChanged", newValue);
            this.fen = newValue;
          }
        } else {
          //! for first call, delay until all squares are on the board
          if (name == CHESS.__WC_ATTRIBUTE_FEN__) {
            setTimeout(() => {
              this.fen = newValue;
            });
          }
        }
      }
      // ======================================================== <chess-board>.listenOnMatchID
      listenOnMatchID() {
        let listenRoot = document.body;
        const invalidIDs = ["testboard", "matchboard"];
        if (this.id && !invalidIDs.includes(this.id)) {
          // --------------------------------------------------- separate listener for each board
          const listenFunc = (evt) => {
            // ----------------------------- get data from EventSource, moves and board state
            let { match_guid, fen, move } = evt.detail;
            if (this.id == match_guid) {
              if (move == CHESS.APIRT.__STARTGAME__) {
                // ----------------------------- startgame
                if (!this.hasAttribute("player")) this.player = CHESS.__PLAYER_WHITE__;
                this.updatePlayerBlack(match_guid);
              } else if (move == "_undomove") {
                this.undoMove();
              } else if (this.fen != fen) {
                // ----------------------------- process move
                let movetype = move[2];
                if (move.includes("O-O")) {
                  //! todo roccade
                  if (logDetail > 0) log("Implement Castling listenOnMatchID");
                } else {
                  if (movetype == "-" || movetype == "x") {
                    setTimeout(() => {
                      this.movePiece(...move.split(movetype)); // from , to
                      if (logDetail > 1) log("FENs move:", move, "\nthis.fen:\t", this.fen, "\nfen:\t\t", fen);
                    });
                  } else {
                    CHESS.log.fen(this, "listenOnMatchID", fen);
                    this.fen = fen;
                  }
                }
              } else {
                this.setAttribute(CHESS.__WC_ATTRIBUTE_FEN__, this.fen);
              }
              this.showLastMoveOnBoard(); // end match-guid Listener
            } // if (this.id == match_guid)
          }; // listenFunc
          // -------------------------------------------------- remove existing listener
          if (this._listening) {
            listenRoot.removeEventListener(this._listening.id, this._listening.func);
          }
          // -------------------------------------------------- add new listener
          this._listening = {
            id: this.id,
            func: listenFunc,
          };
          listenRoot.addEventListener(this.id, listenFunc);
        } // end if (this.id)
      }
      // ======================================================== <chess-board>.readGUID
      updatePlayerBlack(match_guid) {
        CHESS.APIRT.callAPI({
          action: "READ",
          body: { id: match_guid },
          callback: ({ rows }) => {
            let { player_white, player_black, wp_user_white, wp_user_black } = rows[0];
            this.chessmatch.setPlayerTitles(player_white, player_black, wp_user_white, wp_user_black);
          },
        });
      }
      // ======================================================== <chess-board>.id
      get id() {
        return this.getAttribute("id") || "";
      }
      set id(v) {
        if (v) {
          if (logDetail > 2) log("set id", v);
          this.setAttribute("id", v);
          this.listenOnMatchID();
        } else this.removeAttribute("id");
        this.debuginfo();
      }
      // ======================================================== <chess-board>.isTestboard
      get isTestboard() {
        return this.id == CHESS.__TESTBOARD_FOR_MOVES__;
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
      get labels() {
        return this.hasAttribute("labels");
      }
      // ======================================================== <chess-board>.border
      set border(on = false) {
        // Danny and Rob need to implement this.
      }
      get border() {
        return this.hasAttribute("border");
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
      // ======================================================== <chess-board>.setMessage
      setMessage(msg) {
        if (this.id !== CHESS.__TESTBOARD_FOR_MOVES__) {
          document.getElementById("message").innerText = msg;
        }
      }
      // ======================================================== <chess-board>.getSquare
      getSquare(square) {
        // square can be "c5" OR a reference to <chess-square at="c5">
        // return reference to <chess-square at=" [position] ">
        if (square) {
          let squareElement = square;
          if (isString(square)) squareElement = this.queryBoard(`[${CHESS.__WC_ATTRIBUTE_AT__}=${square}]`);
          if (!squareElement) {
            if (logDetail > 0) log(square, "is not a valid square");
          }
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
      // ======================================================== <chess-board>.reload
      reload() {
        location.reload();
      }
      // ======================================================== <chess-board>.restart
      resume(match_guid = console.error("No match_guid specified")) {
        console.error("<chess-board>.resume(guid) code all disabled by Sandro");
        // Old code: Was restart, possible to implement again somewhere else
        // this.clear();

        // this.capturedWhitePieces = [];
        // this.capturedBlackPieces = [];
        // this.chessMovesHistory = [];

        // localStorage.removeItem("fen");
        // this.fen = undefined; // force start position

        // this.dispatch({ name: "restartMatch", detail: { chessboard: this.chessboard } });
        // this.initPlayerTurn();
        this.id = match_guid;
      }
      // ======================================================== <chess-board>.initPlayerTurn
      initPlayerTurn() {
        if (logDetail > 1) log("initPlayerTurn chessboard", this);
        delete this.pieceClicked;
        this.initAnalysis();
        this.highlightOff();
      }
      // ======================================================== <chess-board>.highlightOff
      highlightOff() {
        for (let square of this.squares) {
          let chessSquare = this.getSquare(square);
          chessSquare.highlight(false);
        }
      }
      // ======================================================== <chess-board>.changePlayer
      changePlayer() {
        if (this.player) {
          this.playerturn = CHESS.otherPlayer(this.playerturn); // todo Naar FEN
          if (logDetail > 1) log("changePlayer turn:", this.playerturn, "player:", this.player, this.fen);
        }
      }
      // ======================================================== <chess-board>.dispatch_move
      dispatch_chessboard_moveEvent({
        name, // capturePiece OR storemove in Database
        from, //
        to,
        move,
      }) {
        this.dispatch({
          root: this,
          name,
          detail: {
            chessboard: this,
            fromsquare: from,
            tosquare: to,
            move,
            fen: this.fen,
          },
        });
      }
      // ======================================================== <chess-board>.capturePiece
      capturePiece(pieceName) {
        let chessboard = this;
        let piece = chessboard.getPiece(pieceName) || pieceName;
        if (piece.isWhite) {
          chessboard.capturedWhitePieces.push(piece.is);
          if (chessboard.record) log("Captured White Pieces:", chessboard.capturedWhitePieces);
        } else {
          chessboard.capturedBlackPieces.push(piece.is);
          if (chessboard.record) log("Captured Black Pieces:", chessboard.capturedBlackPieces);
        }
      }
      // ======================================================== <chess-board>.dispatch_capturePiece
      dispatch_capturePiece({
        from = console.error("missing from"), //
        to,
      }) {
        let chessboard = this;
        chessboard.dispatch_chessboard_moveEvent({
          name: CHESS.__CAPTUREDPIECE__,
          from,
          to,
          move: from + "x" + to,
        });
      }
      // ======================================================== <chess-board>.checkif_capturePiece
      checkif_capturePiece(move) {
        let chessboard = this;
        if (move.includes("x")) {
          let [from, to] = move.split("x");
          const /* function */ piece = (at) => chessboard.getSquare(at).piece;
          const /* function */ pieceName = (at) => chessboard.getSquare(at).piece.is;
          log(`${from}x${to} %c ${pieceName(from)} captured %c ${pieceName(to)}`, "background:green;color:beige", "background:red;color:beige");
          chessboard.capturePiece(piece(to));
          chessboard.dispatch_capturePiece({
            from, //
            to,
          });
        }
      }
      // ======================================================== <chess-board>.dispatch_storeMove
      dispatch_storeMove({
        fromSquare = false, // <chess-square> from which piece was moved
        toSquare = false, // <chess-square> to which piece was moved
        move, // "startgame" e2-e4  d7xh8  O-O-O
      }) {
        let chessboard = this;
        chessboard.dispatch_chessboard_moveEvent({
          name: CHESS.__STORECHESSMOVE__,
          chessboard, // chessboard.record TRUE/FALSE if the move will be recorded
          from: fromSquare && fromSquare.at,
          to: toSquare && toSquare.at,
          move,
        });
      }
      // ======================================================== <chess-board>.dispatchChessMove
      // Listeners: Captured Pieces, Game Progress
      dispatchChessMove({
        fromSquare = false, // <chess-square> from which piece was moved
        toSquare = false, // <chess-square> to which piece was moved
        move, // "startgame" e2-e4  d7xh8  O-O-O
      }) {
        let chessboard = this;
        if (chessboard.record && chessboard.id !== CHESS.__TESTBOARD_FOR_MOVES__) {
          // emit Event to <chess-match> which records all moves in database
          chessboard.dispatch_storeMove({ fromSquare, toSquare, move });
        } else {
          log("NOT dispatching STORECHESSMOVE");
        }
      }
      // ======================================================== <chess-board>.dispatch_GUID
      dispatch_GUID({
        fen = this.fen, //! is it valid to NOT pass a fen?
        move,
      }) {
        let chessboard = this;
        let match_guid = chessboard.id;
        chessboard.dispatch({
          name: match_guid,
          detail: {
            match_guid,
            fen, //! should be this.fen?
            move,
          },
        });
        chessboard.checkif_capturePiece(move);
      }
      // ======================================================== <chess-board>.addChessMove
      addChessMove({
        chessPiece = false, // moves from database don't know chesspiece
        fromSquare,
        toSquare,
        fen,
        move,
      }) {
        let chessboard = this;
        chessboard.chessMovesHistory.addMove({
          chessPiece,
          fromSquare: chessboard.getSquare(fromSquare),
          toSquare: chessboard.getSquare(toSquare),
          fen,
          move,
        });
      }

      // ======================================================== <chess-board>.movePiece
      movePiece(chessPiece, square, animated = true) {
        log(
          "movePiece",
          "id:" + this.id.substring(0, 10), //
          "chessPiece:",
          isString(chessPiece) ? chessPiece : chessPiece.is,
          "to square:",
          square,
          "fen:",
          this.fen
        );
        if (isString(chessPiece)) {
          chessPiece = this.getPiece(chessPiece); // convert "e2" to chessPiece IN e2
          if (!chessPiece) {
            log("Er staat geen chesspiece op:", square);
            return;
          }
        }
        const movedPiece = () => {
          let fromSquare = chessPiece.square;
          let toSquare = this.getSquare(square);
          let moveType = toSquare.piece ? CHESS.__MOVETYPE_CAPTURE__ : CHESS.__MOVETYPE_MOVE__;
          const lastFEN = this.fen;

          // Clear en Passant pawn and add to capturedPiece
          if (this.lastMove && toSquare.at == this.enPassantPosition && chessPiece.isPawn) {
            console.error("capturePieceBy 1", chessPiece);
            this.lastMove.toSquare.capturePieceBy(chessPiece);
            moveType = CHESS.__MOVETYPE_CAPTURE__;
            if (logDetail > 1) log("We had En Passant. Clear piece.");
            this.lastMove.toSquare.clear();
          }

          // Strike rook, clean castlingArray
          if (toSquare.piece.isRook) {
            const removeFENletter = {
              a1: "Q",
              h1: "K",
              a8: "q",
              h8: "k",
            }[toSquare.at];
            this.castlingArray = this.castlingArray.filter((item) => item !== removeFENletter);
          }
          // Capture Piece => capturePieceBy
          console.error(`capturePieceBy 2`, chessPiece.at, chessPiece.is, chessPiece.at, "->", square);
          toSquare.capturePieceBy(chessPiece);

          // movePiece
          toSquare.addPiece(chessPiece);
          if (fromSquare) fromSquare.clear();
          chessPiece.animateFinished(); // do <chess-piece> CSS stuff after animation finished

          if (logDetail > 1) log("PLAYER & TURN:", this.player, this.playerturn);
          const move = fromSquare.at + moveType + toSquare.at;
          if (logDetail > 1) log("chessPiece, from, to, move", chessPiece, fromSquare, toSquare, move);

          const saveMoveToChessMovesHistory = () => {
            if (true || this.player === this.playerturn) {
              //! todo check if this check is needed
              this.addChessMove({
                chessPiece, //
                fromSquare, //
                toSquare, //
                fen: lastFEN, //
                move,
              });
            } else {
              log("NOT saving move to chessMovesHistory because player != playerturn", this.isUpdating);
            }
          };

          const /*function*/ store_Dispatch_Move = (move) => {
              if (this.player !== this.playerturn && !this.isTestboard) {
                this.chessmatch.storeMove({
                  chessboard: this,
                  move,
                  fen: this.fen,
                });
                this.dispatchChessMove({ fromSquare, toSquare, move });
              }
            };

          if (this.doingCastling) {
            if (chessPiece.isKing) {
              // this.recordMoveInDatabase({
              //   fromSquare,
              //   toSquare,
              //   move: this.doingCastling, //record castling type "O-O"  "O-O-O"
              // });
            } else {
              // Rook in castling mode
              this.chessMovesHistory.deleteLastMove(); // delete rook move
              let savedFEN = this.lastMove.fen;
              this.chessMovesHistory.deleteLastMove(); // delete king move
              saveMoveToChessMovesHistory(); // save castling move
              this.lastMove.fen = savedFEN;
              this.changePlayer();
              store_Dispatch_Move(this.doingCastling);
              this.doingCastling = false;
            }
          } else {
            // regular move
            saveMoveToChessMovesHistory();

            this.changePlayer();
            store_Dispatch_Move(fromSquare.at + moveType + toSquare.at);
          }

          this.play(); // play all moves left in the queue
          this.showLastMoveOnBoard();
          return chessPiece;
        }; // end movedPiece function

        if (animated) chessPiece.animateTo(square).then(movedPiece);
        else movedPiece();

        if (this.doAnalysis && !this.isTestboard) {
          CHESS.analysis(this, CHESS.__ANALYSIS_AFTER__);
        }

        if (!this.isTestboard) {
          setTimeout(() => {
            this.initPlayerTurn();
          }, 1000);
        }

        this.setMessage("");
      }
      // ======================================================== <chess-board>.showLastMoveOnBoard
      showLastMoveOnBoard() {
        if (this.lastMove) {
          const /*function*/ updateLastMoveSquares = (squares) =>
              this.dispatch({
                name: CHESS.__CHESSSQUAREUPDATE__,
                detail: {
                  squares,
                },
              });
          updateLastMoveSquares([]); // empty array resets all squares, removes 'lastmove' class
          updateLastMoveSquares([
            // sets 'lastmove' class on squares
            this.lastMove.fromSquare.at, // fromSquare
            this.lastMove.toSquare.at, // toSquare
          ]);
        } else {
          console.warn("No lastMove on board");
        }
      }
      // ======================================================== <chess-board>.initAnalysis
      // initAnalysis wordt aangeroepen in einde Click-event.
      initAnalysis() {
        if (this.doAnalysis) {
          console.warn("initAnalysis");
          CHESS.analysis(this, CHESS.__ANALYSIS_PRE__);
        }
      }
      // ======================================================== <chess-board>.lastMove
      get lastMove() {
        if (this.chessMovesHistory.length) {
          return this.chessMovesHistory.lastMove;
        }
        return undefined; // keep ESlint quiet, every programmer should know functions return undefined by default
      }
      // ======================================================== <chess-board>.undoMove
      undoMove() {
        //! action="UNDOMOVE" "CLEARMOVES" + MATCH_GUID
        if (this.lastMove) {
          this.fen = this.lastMove.fen; // board is correct again
          this.chessMovesHistory.deleteLastMove();
        }
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
        color = this.getAttribute(CHESS.__WC_ATTRIBUTE_PLAYERTURN__), // get default color from <chess-board player="..."
        showwarning = false,
        warning = /* function */ () => console.warn("No king on the board!") // optional warning function
      ) {
        const king = color + "-" + CHESS.__PIECE_KING__;
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
      set fen(fenString = CHESS.__STARTFEN__) {
        if (logDetail > 2) log("Set fen START\t", fenString);
        // TODO: Waarom hier?? Omdat er altijd een castlingArray moet zijn als je een fen op het bord zet.
        this.castlingArray = ["K", "Q", "k", "q"];

        //! THIS WILL TRIGGER set fen again: this.setAttribute(CHESS.__WC_ATTRIBUTE_FEN__, fenString);
        // make sure we don't run before the board exists, because attributeChangedCallback runs early
        // setTimeout(() => {
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
                this.playerturn = CHESS.__PLAYER_BLACK__;
              } else {
                this.playerturn = CHESS.__PLAYER_WHITE__;
              }
            }
            // castling "KQkq" becomes this.castlingArray = ["K", "Q", "k", "q"]
            if (castling && castling !== "-") this.castlingArray = castling.split("");
            // enpassant
            if (enpassant && enpassant !== "-") this.enPassantPosition = enpassant;
          }
        } else {
          console.warn("NOT set fen, No this.squares");
          // when the constructor runs on document.createElement, the squares are not set yet.
        }
        // }, 100);
        // this.setAttribute(CHESS.__WC_ATTRIBUTE_FEN__, fenString);
        this.classList.remove("game_over");

        // only analyze the board when there are squares on the board.
        this.debuginfo();
        // if (this.doAnalysis && !this.isTestboard) {
        //   CHESS.analysis(this, CHESS.__ANALYSIS_PRE__);
        // }
        if (logDetail > 2) log("set fen END\t", fenString);
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
        if (this.playerturn == CHESS.__PLAYER_WHITE__) {
          player = "w";
        } else {
          player = "b";
        }
        fenParts.push(player);

        // castling
        let castling = "";
        //if (logDetail > 1) log("Castling Array", 666);
        if (this.castlingArray) {
          if (this.castlingArray.length) castling = this.castlingArray.join("");
          else castling = "-";
        } else {
          //! waarom is die castlingArray er niet?
          console.error("No this.castlingArray - Logical Error");
        }
        fenParts.push(castling);
        // enpassant
        //todo fix enpassant to remove after 1 turn.
        let enpassant = "-";
        if (this.enPassantPosition) enpassant = this.enPassantPosition;
        fenParts.push(enpassant);
        // join
        fenString = fenParts.join(" ");
        if (logDetail > 2) log("return fen:\t", fenString);
        // console.warn("this.innerHTML", this.innerHTML);
        return fenString;
      } // get fen()
      // ======================================================== <chess-board>.all shit with pieces
      //! TODO
      piecesAdministration() {
        let pieces = (this.piecenames = {
          all: CHESS.__STARTFEN__
            .split(" ")[0]
            .split("")
            .filter((x) => CHESS.__FEN_LETTERS__.includes(x)) // remove digits and /
            .map((fenLetter) => CHESS.convertFEN(fenLetter)),
        });
        // return an array of pieces on the board.
        pieces.board = [];
        for (const square of this.squares) {
          let piece = this.getSquare(square).piece;
          if (piece) pieces.board.push(piece.is);
        }
        // return an array of pieceNames that are captured.
        pieces.captured = [...pieces.all];
        pieces.board.map((x, idx) => {
          let i = pieces.captured.indexOf(x);
          if (i > -1) delete pieces.captured[i];
          return x;
        });
        pieces.captured = pieces.captured.filter((x) => x);
        pieces.capturedWhite = pieces.captured.filter((n) => n.startsWith(CHESS.__PLAYER_WHITE__));
        pieces.capturedBlack = pieces.captured.filter((n) => n.startsWith(CHESS.__PLAYER_BLACK__));
        console.log(this.piecenames);
      }
      // ======================================================== <chess-board>.record GETTER
      get record() {
        return this.hasAttribute(CHESS.__WC_ATTRIBUTE_RECORD__);
      }
      // ======================================================== <chess-board>.ready_for_play(){
      ready_for_play() {
        let chessboard = this;
        let { player, playerturn } = chessboard;
        if (player == playerturn) {
          log(`YOUR TURN! %c ${player}`, "background:red;color:beige;font-weight:bold;font-size:120%");
        }
        this.piecesAdministration();
        this.dispatch({
          name: CHESS.__CHESSBOARD_READY__, //
          detail: {
            chessboard: this,
            match_guid: this.id,
          },
        });
      }
      // ======================================================== <chess-board>.play
      play(moves = this._doingmoremoves) {
        // chessboard.play([["e2", "e4"], ["e7", "e5"], ["g1", "f3"], ["b8", "c6"]]);
        // TODO: rewrite to ["e2-e4", "e7-e5", "g1-f3", "b8-c6"] so "x" take piece can be used
        // console.error("Play", moves);
        if (!this._doingmoremoves) this._doingmoremoves = moves;
        if (this._doingmoremoves && this._doingmoremoves.length) {
          let [from, to] = this._doingmoremoves.shift();
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
        } else {
          // console.error(666, "No play moves", this);
          // delete this._doingmoremoves;
        }
      }
      adddplaymove(from, to) {
        this._doingmoremoves.unshift([from, to]);
      }
      // ======================================================== <chess-board>.mockMove
      mockMove(move = "e2-e4") {
        CHESS.EVENTSOURCE.dispatchMove(this, {
          match_guid: this.id, //
          move,
          fen: "mockMove:" + move,
        });
      }
      // ======================================================== <chess-board>.trymove
      trymove({
        from, // "e2"
        to, // "e3"
        matchboard = this, // the <chess-board> the user is playing
      }) {
        let testPiece = this.getPiece(from);
        if (testPiece) {
          if (logDetail > 2) log("trymove", testPiece.is, from, "->", to);
          testPiece.movePieceTo(to, false); // move piece without animation
          if (CHESS.doAnalysis && CHESS.analysis(this, "checkcheck")) {
            matchboard.markIllegalMove(to);
          }
        } else {
          console.error("trymove Error: no Piece on:", from);
        }
        //this.fen = savedfen;
      }
      // ======================================================== <chess-board>.markIllegalMove
      markIllegalMove(at) {
        if (logDetail > 0) log("666-DE MarkIllegalMove", at);
        this.getSquare(at).highlight(CHESS.__MOVETYPE_ILLEGAL__);
        this.pieceClicked.moves = this.pieceClicked.moves.filter((move) => move !== this.getSquare(at).at);
      }

      // ======================================================== <chess-board>.remove
      delete() {
        this.remove();
      }
      // ============================================================ <chess-board>.player on board
      get player() {
        return this.getAttribute(CHESS.__WC_ATTRIBUTE_PLAYER__);
      }

      set player(value) {
        log("set player", value);
        this.setAttribute(CHESS.__WC_ATTRIBUTE_PLAYER__, value);
      }

      // ============================================================ <chess-board>.setPlayerAndFEN
      setPlayerAndFEN(player, fen) {
        if (logDetail > 0) log("setPlayerAndFEN", player, fen);
        this.player = player;
        CHESS.log.fen(this, "setPlayerAndFEN", fen);
        this.fen = fen;
      }
      // ============================================================ <chess-board>.playerturn = current player
      // wie er aan zet is
      get playerturn() {
        return this.getAttribute(CHESS.__WC_ATTRIBUTE_PLAYERTURN__);
      }
      set playerturn(v) {
        log("set playerturn", v, "lastMove:", this.lastMove?.move);
        this.setAttribute(CHESS.__WC_ATTRIBUTE_PLAYERTURN__, v);
        this.showLastMoveOnBoard();
      }
      // ============================================================ <chess-board>.updateFENonScreen
      updateFENonScreen() {
        let fenElement = document.getElementById("fen");
        if (fenElement) fenElement.value = this.fen;
      }
      // ============================================================ <chess-board>.debuginfo
      debuginfo() {
        let debuginfo = document.getElementById("chessboard_debuginfo");
        if (debuginfo && this.id != CHESS.__TESTBOARD_FOR_MOVES__) debuginfo.innerHTML = `GUID: ${this.id}   __ FEN: ${this.fen}`;
      }
    } // class ChessBoard
  ); // end of class definition

  // ********************************************************** end IIFE
})();
