// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  function log(...args) {
    console.log("%c chess-match ", "background:purple;color:yellow", ...args);
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
      // ======================================================== <chess-square>.handleFirstClick
      handleFirstClick() {
        if (this.hasAttribute(CHESS.__WC_ATTRIBUTE_PIECENAME__)) {
          this.chessboard.highlightOff();
          this.piece.potentialMoves(this.at);
          this.piece.potentialKingMoves(this.at);
          this.chessboard.pieceClicked = this.piece; // Hier wordt pieceClicked pas gedefinieerd.
          this.piece.disableCheckMakingMoves({
            showboardsIn: document.getElementById("TEST4CHECKBOARDS") || document.body, //! REQUIRED FOR NOW
          });
          // console.log("Zetten: ", this.piece.pieceName, this.chessboard.pieceClicked.moves);
        }
      }
      // ======================================================== <chess-square>.handleSecondClick
      handleSecondClick() {
        const { chessboard, at } = this;
        let validMove = chessboard.pieceClicked.moves.includes(at);
        if (chessboard.pieceClicked) {
          if (validMove) chessboard.movePiece(chessboard.pieceClicked, at);
          else {
            this.handleFirstClick();
          }
        } else {
          console.warn("handleSecondClick : No piece clicked");
        }
      }
      // ======================================================== <chess-square>.connectedCallback
      connectedCallback() {
        this.addEventListener("click", () => {
          log("`click` event on", this.at);
          if (this.chessboard.pieceClicked) {
            this.handleSecondClick();
          } else {
            this.handleFirstClick();
          }
        });
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
        piece = piece || CHESS.__FEN_WHITE_KING__; // default value for undefined piece
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
        const pieceName = piece.is;
        if (piece) {
          if (piece.isWhite) {
            chessboard.capturedWhitePieces.push(pieceName);
            if (chessboard.record) log("Captured White Pieces:", chessboard.capturedWhitePieces);
          } else {
            chessboard.capturedBlackPieces.push(pieceName);
            if (chessboard.record) log("Captured Black Pieces:", chessboard.capturedBlackPieces);
          }
          // this.clear();
          // this.append(chessPiece); // put piece in new location
          return pieceName;
        } else return false;
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
