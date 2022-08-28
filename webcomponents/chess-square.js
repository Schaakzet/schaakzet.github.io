// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  const __COMPONENT_NAME__ = CHESS.__WC_CHESS_SQUARE__;
  // ********************************************************** logging

  // the amount of console.logs displayed in this component
  let logDetailComponent = 1; //! -1=no logs 0=use global setting >0=custom setting
  let logComponent = window.CHESS.log[__COMPONENT_NAME__];
  let logDetail = logDetailComponent || logComponent.detail;
  function log() {
    console.logColor &&
      console.logColor(
        {
          name: __COMPONENT_NAME__,
          background: "purple",
          ...logComponent,
        },
        ...arguments
      );
  }

  /*************************************************************************
   <chess-square defendedby="Qf5" attackedby="nc5"> Web Component
   */
  customElements.define(
    CHESS.__WC_CHESS_SQUARE__,
    class extends CHESS.ChessBaseSquarePieceElement {
      // ======================================================== <chess-square>.observedAttributes
      static get observedAttributes() {
        return [CHESS.__WC_ATTRIBUTE_PIECENAME__];
      }

      // ======================================================== <chess-square>.constructor
      constructor() {
        super();
      }
      // ======================================================== <chess-square>.connectedCallback
      connectedCallback() {
        super.connectedCallback();
        this.addEventListener("click", () => {
          log("`click` event on", this.at);
          if (this.chessboard.pieceClicked) {
            this.handleSecondClick();
          } else {
            this.handleFirstClick();
          }
        });
        // ----------------------------------------------------- class 'lastmove' updates
        this.chessboard.addEventListener(CHESS.__CHESSSQUAREUPDATE__, (evt) => {
          let { squares } = evt.detail;
          this.classList.toggle("lastmove", squares.includes(this.at));
        });
      }
      // ======================================================== <chess-square>.handleFirstClick
      handleFirstClick() {
        if (this.hasAttribute(CHESS.__WC_ATTRIBUTE_PIECENAME__)) {
          this.chessboard.highlightOff();
          this.piece.potentialMoves(this.at);
          if (logDetail > 1) log("potenialMoves:", this.piece.moves);
          this.piece.potentialKingMoves(this.at);
          if (logDetail > 1) log("+KingMoves", this.piece.moves);

          this.chessboard.pieceClicked = this.piece; // Hier wordt pieceClicked pas gedefinieerd.

          this.piece.disableCheckMakingMoves({
            showboardsIn: document.getElementById("TEST4CHECKBOARDS") || document.body,
          });
        }
      }
      // ======================================================== <chess-square>.handleSecondClick
      handleSecondClick() {
        const { chessboard, at } = this;
        const { isFreeplay, pieceClicked } = chessboard;
        if (pieceClicked) {
          let validMove = pieceClicked.moves.includes(at);
          let isSameSquare = at == pieceClicked.at;
          console.error(isSameSquare, at, pieceClicked.at, pieceClicked.moves, validMove, isSameSquare);
          if (isSameSquare) {
            chessboard.pieceClicked = false;
            chessboard.highlightOff();
          } else if (isFreeplay || validMove) {
            chessboard.movePiece(pieceClicked, at);
          } else {
            this.handleFirstClick();
          }
        } else {
          console.warn("handleSecondClick : No piece clicked");
        }
      }
      // ======================================================== <chess-square>.piece
      get piece() {
        return this.querySelector(CHESS.__WC_CHESS_PIECE__) || false;
      }
      set piece(v) {
        // TODO: process as string or element
        // on string createElement
      }
      // ======================================================== <chess-square>.squareElement
      squareElement(squareName) {
        return this.chessboard.getSquare(squareName);
      }
      // ======================================================== <chess-square>.addPiece
      addPiece(piece = console.error("No piece defined!")) {
        piece = piece || "K"; // default value for undefined piece
        let name;
        if (isString(piece)) {
          name = piece.length == 1 ? CHESS.convertFEN(piece) : piece;
          piece = document.createElement(CHESS.__WC_CHESS_PIECE__); // create <chess-piece is="wit-koning">
          piece.is = name;
        } else {
          name = piece.is;
        }
        this.clear();
        this.pieceName = name;
        piece = this.appendChild(piece);
        return piece;
      }
      // ======================================================== <chess-square>.addAttribute
      addAttribute(attr_name, arr, piece) {
        arr.push(piece.fen_at);
        this.setAttribute(attr_name, arr.join(","));
      }
      // ======================================================== <chess-square>.getAttributeArray
      getAttributeArray(attr_name) {
        let arr = this.getAttribute(attr_name);
        return arr ? arr.split(",") : [];
      }
      // ======================================================== <chess-square>.attacks
      attackedBy(chessPiece) {
        this.addAttribute(CHESS.__WC_ATTRIBUTE_ATTACKEDBY__, this.attackers, chessPiece);
      }
      get attackers() {
        return this.getAttributeArray(CHESS.__WC_ATTRIBUTE_ATTACKEDBY__);
      }
      get isAttacked() {
        return this.attackers.length > 0;
      }
      // ======================================================== <chess-square>.defend
      defendedBy(chessPiece) {
        this.addAttribute(CHESS.__WC_ATTRIBUTE_DEFENDEDBY__, this.defenders, chessPiece);
      }
      get isDefended() {
        return this.defenders.length > 0;
      }
      get defenders() {
        return this.getAttributeArray(CHESS.__WC_ATTRIBUTE_DEFENDEDBY__); // = ["Qe3","na4","Rf5"]
      }
      isDefendedBy(color) {
        // return TRUE/FALSE if this square is defended by a piece of the given color
        return (
          this.defenders.filter(([fen, file, rank]) => {
            return this.chessboard.getPiece(file + rank).color == color;
          }).length > 0
        );
      }
      // ======================================================== <chess-square>.movesFrom
      movesFrom(chessPiece) {
        this.addAttribute(CHESS.__WC_ATTRIBUTE_MOVESFROM__, this.movers, chessPiece);
      }

      get movers() {
        return this.getAttributeArray(CHESS.__WC_ATTRIBUTE_MOVESFROM__);
      }
      // ======================================================== <chess-square>.translate
      translate(x_move, y_move) {
        // TODO: This is the same code as possibleMove in <chess-piece>
        const files = this.chessboard.files;
        const ranks = this.chessboard.ranks1to8;
        const position = this.at;
        const x = files.indexOf(position[0]);
        const y = ranks.indexOf(position[1]);
        const toFile = files[x + x_move];
        const toRank = ranks[y + y_move];
        if (toFile && toRank) {
          return toFile + toRank; // example: "d5"
        } else {
          return false;
        }
      }
      // ======================================================== <chess-square>.highlight
      highlight(state = false) {
        if (state) {
          const undefined_state = "2px dashed hotpink";
          this.setAttribute("state", state);
          // pick a state string from definedstates "x" , "p" , "-"
          this.style.border =
            {
              [CHESS.__ATTACK_PIECE__]: "5px solid red",
              [CHESS.__EMPTY_SQUARE__]: "5px solid green",
              [CHESS.__PROTECT_PIECE__]: "5px solid orange", // todo: implement
              [CHESS.__MOVETYPE_ILLEGAL__]: "2px dashed red",
            }[state] || undefined_state;
        } else {
          this.style.border = "";
          this.removeAttribute("state");
        }
      }
      // ======================================================== <chess-square>.clear
      clear() {
        this.removeAttribute(CHESS.__WC_ATTRIBUTE_PIECENAME__); // Removes from Square
        this.style.border = "";
        this.innerHTML = ""; // Removes from board
        this.clearAttributes();
      }
      // ======================================================== <chess-square>.clearAttributes
      clearAttributes() {
        this.removeAttribute(CHESS.__WC_ATTRIBUTE_ATTACKEDBY__);
        this.removeAttribute(CHESS.__WC_ATTRIBUTE_DEFENDEDBY__);
        this.removeAttribute(CHESS.__WC_ATTRIBUTE_MOVESFROM__);
      }
      // ======================================================== <chess-square>.pieceName
      get pieceName() {
        return this.getAttribute(CHESS.__WC_ATTRIBUTE_PIECENAME__) || "";
      }
      set pieceName(pieceName) {
        this.setAttribute(CHESS.__WC_ATTRIBUTE_PIECENAME__, pieceName);
        return pieceName;
      }
      // ======================================================== <chess-square>.capturePieceBy
      capturePieceBy(chessPiece = { is: "NO PIECE" }) {
        const { chessboard, piece } = this;
        if (piece) {
          const pieceName = piece.is;
          log(`${this.at} ${this.piece.is}`, `capturePieceBy ${chessPiece.is} at ${chessPiece.at}`);
          //! vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
          //! if the piece is already at the square, then abort
          if (chessPiece.at == this.at) {
            console.error(`${chessPiece.is} is already at ${chessPiece.at}`);
            console.error(`%c Now piece is lost on this board`, "background-color:red;color:yellow;");
            return false;
          }
          //! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          chessboard.capturePiece(piece);
          // this.clear();
          // this.append(chessPiece); // put piece in new location
          chessboard.dispatch_capturePiece({
            from: chessPiece.at,
            to: this.at,
          });
          return pieceName;
        } else {
          log("No piece to capture on", this.at);
          return false;
        }
      }
      // ======================================================== <chess-square>.rankDistance
      rankDistance(toSquare) {
        return Math.abs(toSquare.rank - this.rank);
      }
      // ======================================================== <chess-square>.isMovesFrom
      isMovesFrom(color) {
        //CHESS.__PLAYER_WHITE__
        //this.movers = ["Pg2, qh4"]
        return (
          this.movers.filter(([fen, file, rank]) => {
            if (!this.chessboard.getPiece(file + rank).isKing) {
              return this.chessboard.getPiece(file + rank).color == color;
            }
          }).length > 0
        ); // true/false
      } // <chess-square>.isMovesFrom
    } // <chess-square>
  ); //defineElement(CHESS.__WC_CHESS_SQUARE__)
  // ********************************************************** end IIFE
})();
