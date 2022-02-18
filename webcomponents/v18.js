// V18.js - Check, checkmate and stalemate

class ChessBaseElement extends HTMLElement {
  // ======================================================== ChessBaseElement.movePiece
  docs(obj) {
    if (obj) {
      let proto = Reflect.getPrototypeOf(obj);
      let methods = [];
      let props = [];
      function log(name, arr) {
        arr = arr.filter((x) => x != "constructor");
        console.warn(`%c ${obj.nodeName} ${name}:`, "background:gold", arr.join(", "));
      }
      Reflect.ownKeys(proto).forEach((key) => {
        try {
          if (typeof proto[key] == "function") methods.push(key);
        } catch (e) {
          props.push(key);
        }
      });
      log("methods", methods);
      log("properties", props);
    }
  }
}

const __PROTECT_PIECE__ = "p"; // used to highlight the moves a chesspiece can make
const __ATTACK_PIECE__ = "x"; // used to highlight the moves a chesspiece can make
const __EMPTY_SQUARE__ = "e"; // used to highlight the moves a chesspiece can make
const __MOVETYPE_MOVE__ = "-"; // used in move notation
const __MOVETYPE_CAPTURE__ = __ATTACK_PIECE__; // used in move notation
const __PLAYER_WHITE__ = "wit"; // used as player color AND chesspiece names
const __PLAYER_BLACK__ = "zwart"; // used as player color AND chesspiece names

const otherPlayer = (color) => (color == __PLAYER_WHITE__ ? __PLAYER_BLACK__ : __PLAYER_WHITE__);

const squareStateCSS = (player) => /*css*/ `chess-board[player="${player}"] chess-square[piece*="${otherPlayer(player)}"]:not([state="x"]){
  pointer-events:none;
  background: ${player == __PLAYER_WHITE__ ? "lightblue" : "lightgreen"};
}`;

const chessboardSTYLES =
  /*css*/ `<style id="chessboard_definition">
  ${squareStateCSS(__PLAYER_WHITE__)}
  ${squareStateCSS(__PLAYER_BLACK__)}
chess-board {
  --width: 100%;
  width: var(--width);
  max-width:80vh;
  height: var(--width);
  /* display <chess-board> as blocks next to eachother */
  display: inline-block;
  /* all my child elements are relative to my size */
  position: relative;
  border: calc(var(--width) / 40) solid gray;
}` +
  `chess-board:after{content:"";display:block;padding-bottom:100%}` + // make sure chessboard displays as a square
  /* position multiple layers on top of eachother */
  /* width/height is 100% of <chess-board> */
  /* display all elements inside a layer in a 8x8 grid */
  /*css*/ `.chessboard_layer {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  grid-template-areas:
    "a8 b8 c8 d8 e8 f8 g8 h8"
    "a7 b7 c7 d7 e7 f7 g7 h7"
    "a6 b6 c6 d6 e6 f6 g6 h6"
    "a5 b5 c5 d5 e5 f5 g5 h5"
    "a4 b4 c4 d4 e4 f4 g4 h4"
    "a3 b3 c3 d3 e3 f3 g3 h3"
    "a2 b2 c2 d2 e2 f2 g2 h2"
    "a1 b1 c1 d1 e1 f1 g1 h1";}</style>` +
  `<style>` +
  /*css*/ `.chessboard_layer:empty {display: none}` + //hide empty layers
  `chess-square {overflow:hidden;max-height:100%}` /* keep the square square no matter what is put inside it */ +
  `.black_square {background-color: darkgray}` +
  `.white_square {background-color: white}` +
  `chess-piece {display:inline-block}` +
  `chess-piece > * {width: 100%;position: relative}` +
  `</style>`;

const chessboardSquareLabels = /*html*/ `<style id="squarelabels">
  chess-square:after {
    content: attr(at);
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px}
    </style>`;

const chessboardAREAS = /*html*/ `<style id="chessboard_gridareas"></style>`; // inject 64 gridarea definitions here
const chessboardHTML = /*html*/ `<div id="chessboard_squares" class="chessboard_layer"></div><div id="chessboard_pieces" class="chessboard_layer"></div>`;
const chessboard_innerHTML = chessboardSTYLES + chessboardSquareLabels + chessboardAREAS + chessboardHTML;

//`<style>chess-square:before{content:"d:" attr(defendedby) " a:" attr(attackedby)}</style>`
/* // moves for all pieces */
const __HORSEMOVES__ = [[[2, 1]], [[2, -1]], [[-2, 1]], [[-2, -1]], [[1, 2]], [[1, -2]], [[-1, 2]], [[-1, -2]]];
const __BISHOPMOVES__ = [
  [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 5],
    [6, 6],
    [7, 7],
  ],
  [
    [-1, -1],
    [-2, -2],
    [-3, -3],
    [-4, -4],
    [-5, -5],
    [-6, -6],
    [-7, -7],
  ],
  [
    [-1, 1],
    [-2, 2],
    [-3, 3],
    [-4, 4],
    [-5, 5],
    [-6, 6],
    [-7, 7],
  ],
  [
    [1, -1],
    [2, -2],
    [3, -3],
    [4, -4],
    [5, -5],
    [6, -6],
    [7, -7],
  ],
];
const __ROOKMOVES__ = [
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
  ],
  [
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
    [6, 0],
    [7, 0],
  ],
  [
    [0, -1],
    [0, -2],
    [0, -3],
    [0, -4],
    [0, -5],
    [0, -6],
    [0, -7],
  ],
  [
    [-1, 0],
    [-2, 0],
    [-3, 0],
    [-4, 0],
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
];
const __QUEENMOVES__ = [...__BISHOPMOVES__, ...__ROOKMOVES__];
const __KINGMOVES__ = [[[0, 1]], [[1, 1]], [[1, 0]], [[1, -1]], [[0, -1]], [[-1, -1]], [[-1, 0]], [[-1, 1]]];

/*************************************************************************
 <chess-piece is="wit-paard" at="D5"> Web Component
 */
customElements.define(
  "chess-piece",
  class extends ChessBaseElement {
    // ======================================================== <chess-piece>.observedAttributes
    static get observedAttributes() {
      return ["is"]; // listen to is attribute
    }
    // ======================================================== <chess-piece>.attributeChangedCallback
    attributeChangedCallback(name, oldValue, newValue) {
      // if is attribute changed, render new image
      this.innerHTML = `<img src="https://schaakzet.github.io/img/${newValue}.png">`;
    }
    // ======================================================== <chess-piece>.movePiece
    movePieceTo(at) {
      this.chessboard.movePiece(this, at);
    }
    // ======================================================== <chess-piece>.chessboard

    get chessboard() {
      return this.closest("chess-board");
    }
    // ======================================================== <chess-piece>.square
    get square() {
      return this.closest("chess-square");
    }
    // ======================================================== <chess-piece>.at
    get at() {
      return this.square.getAttribute("at");
    }
    set at(at) {
      this.chessboard.movePiece(this, at);
    }
    // ======================================================== <chess-piece>.is
    get is() {
      return this.getAttribute("is");
    }
    set is(value) {
      this.setAttribute("is", value);
    }
    // ======================================================== <chess-piece>.color
    get color() {
      const indexStreepje = this.is.indexOf("-");
      return this.is.slice(0, indexStreepje);
    }
    // ======================================================== <chess-piece>.pieceMoves
    isPawnAtEnd() {
      return this.is.endsWith("pion") && (this.at[1] == 8 || this.at[1] == 1);
    }
    // ======================================================== <chess-piece>.pieceMoves
    get pieceMoves() {
      let pieceMoves;
      if (this.is.includes("paard")) {
        pieceMoves = __HORSEMOVES__;
      } else if (this.is.includes("loper")) {
        pieceMoves = __BISHOPMOVES__;
      } else if (this.is.includes("toren")) {
        pieceMoves = __ROOKMOVES__;
      } else if (this.is.includes("koningin")) {
        pieceMoves = __QUEENMOVES__;
      } else if (this.is.includes("koning")) {
        pieceMoves = __KINGMOVES__;
      } else if (
        // Als de pion op de 2e rij staat mag hij 1 of 2 zetten vooruit doen.
        this.is === "wit-pion" &&
        this.chessboard.ranks1to8.indexOf(this.at[1]) === 1
      ) {
        pieceMoves = [
          [
            [0, 1],
            [0, 2],
          ],
        ];
      } else if (this.is === "wit-pion") {
        pieceMoves = [[[0, 1]]];
      } else if (this.is === "zwart-pion" && this.chessboard.ranks1to8.indexOf(this.at[1]) === 6) {
        pieceMoves = [
          [
            [0, -1],
            [0, -2],
          ],
        ];
      } else if (this.is === "zwart-pion") {
        pieceMoves = [[[0, -1]]];
      }
      return pieceMoves;
    }
    // ======================================================== <chess-piece>.possibleMove
    possibleMove = (x_move = 0, y_move = 0) => {
      const files = this.chessboard.files;
      const ranks = this.chessboard.ranks1to8;

      const fromSquare = this.at;
      const x = files.indexOf(fromSquare[0]);
      const y = ranks.indexOf(fromSquare[1]);
      //!! Shorter code:
      // const [file, rank] = this.at;
      // const x = files.indexOf(file);
      // const y = ranks.indexOf(rank);

      const toFile = files[x + x_move];
      const toRank = ranks[y + y_move];
      // both need to be defined
      if (toFile && toRank) {
        return toFile + toRank; // example: "d5"
      } else {
        return false;
      }
    };
    // ======================================================== <chess-piece>.potentialMoves
    potentialMoves() {
      // De array potentialMovesArray is alle mogelijkheden van possibleMove.
      // console.error(666, "check potentialMoves:", this.is, " on ", this.at);
      let potentialMovesArray = [];
      let pieceMoves = this.pieceMoves;
      for (let line = 0; line < pieceMoves.length; line++) {
        for (let move = 0; move < pieceMoves[line].length; move++) {
          let xAxis = pieceMoves[line][move][0]; // get x movement
          let yAxis = pieceMoves[line][move][1]; // get y movement
          let squareName = this.possibleMove(xAxis, yAxis);
          if (squareName) {
            const squareElement = this.chessboard.getSquare(squareName); // get <chess-square> element
            let isPawn = this.is.endsWith("pion");
            //Eerst kijken of er een piece staat, en dan kijken of het dezelfde kleur heeft.
            if (squareElement.piece) {
              if (isPawn) {
                // We doen niks
              } else if (this.color === squareElement.piece.color) {
                squareElement.highlight(__PROTECT_PIECE__);
                squareElement.defendedBy(this);
              } else {
                // not a pawn
                // Als het een andere kleur heeft, __ATTACK_PIECE__, potentialMove!
                // attackedby="Nb6,Qf3"
                squareElement.highlight(__ATTACK_PIECE__);
                squareElement.attackedBy(this);
                potentialMovesArray.push(squareName);
              }
              // Deze break is er voor om niet stukken OVER een ander stuk nog te checken.
              // Als er geen piece op de squareElement staat. EMPTY.
              break;
            } else {
              squareElement.highlight(__EMPTY_SQUARE__);
              potentialMovesArray.push(squareName);
              if (!isPawn) {
                squareElement.defendedBy(this);
              }
            }
          } else {
            // move is outside board
          }
        } // for move
      } // for line

      // Schuin aanvallen van pion.
      const pawnAttack = (piececolor, x, y) => {
        const squareName = this.square.translate(x, y); // "d6"
        const squareElement = this.chessboard.getSquare(squareName);
        // console.error("SN:", squareName, "SEL:", squareElement);
        if (squareElement) {
          // Test of we binnen het bord zijn.
          if (squareElement.piece) {
            if (squareElement.piece.color === piececolor) {
              squareElement.highlight(__ATTACK_PIECE__);
              squareElement.attackedBy(this);
              potentialMovesArray.push(squareName);
            } else {
              squareElement.highlight(__PROTECT_PIECE__);
              squareElement.defendedBy(this);
            }
          } else {
            // En passant
            if (this.chessboard.lastMove) {
              if (squareName == this.chessboard.lastMove.enPassantPosition) {
                squareElement.highlight(__ATTACK_PIECE__);
                squareElement.attackedBy(this);
                potentialMovesArray.push(squareName);
              }
            }
            squareElement.defendedBy(this);
          }
        }
      };

      if (this.is === "wit-pion") {
        pawnAttack(__PLAYER_BLACK__, -1, 1);
        pawnAttack(__PLAYER_BLACK__, 1, 1);
      } else if (this.is === __PLAYER_BLACK__ + "-pion") {
        pawnAttack(__PLAYER_WHITE__, 1, -1);
        pawnAttack(__PLAYER_WHITE__, -1, -1);
      }

      // Roqueren
      if (this.is.endsWith("koning")) {
        const longWhiteTower = this.chessboard.getPiece("a1");
        const shortWhiteTower = this.chessboard.getPiece("h1");
        const longBlackTower = this.chessboard.getPiece("a8");
        const shortBlackTower = this.chessboard.getPiece("h8");

        const playerColor = this.chessboard.getAttribute("player");

        // onderstaande kan vervangen voor door 4x aanroepen van 1 function(fenLetter,destinationSquare,offset,squareName)
        if (playerColor == __PLAYER_WHITE__) {
          if (this.chessboard.castlingArray.includes("Q") && longWhiteTower.moves && longWhiteTower.moves.includes("d1")) {
            if (this.chessboard.castlingInterrupt(__PLAYER_WHITE__, -3)) {
              const squareName = "c1";
              this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
              potentialMovesArray.push(squareName);
            }
          }
          if (this.chessboard.castlingArray.includes("K") && shortWhiteTower.moves && shortWhiteTower.moves.includes("f1")) {
            if (this.chessboard.castlingInterrupt(__PLAYER_WHITE__, 2)) {
              const squareName = "g1";
              this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
              potentialMovesArray.push(squareName);
            }
          }
        } else if (playerColor == __PLAYER_BLACK__) {
          if (this.chessboard.castlingArray.includes("q") && longBlackTower.moves && longBlackTower.moves.includes("d8")) {
            if (this.chessboard.castlingInterrupt(__PLAYER_BLACK__, -3)) {
              const squareName = "c8";
              this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
              potentialMovesArray.push(squareName);
            }
          }
          if (this.chessboard.castlingArray.includes("k") && shortBlackTower.moves && shortBlackTower.moves.includes("f8")) {
            if (this.chessboard.castlingInterrupt(__PLAYER_BLACK__, 2)) {
              const squareName = "g8";
              this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
              potentialMovesArray.push(squareName);
            }
          }
        }
      }
      this.moves = potentialMovesArray;
    } // potentialMoves
    // ======================================================== <chess-piece>.animateTo
    animateTo(destinationSquare) {
      let { top, left } = this.getBoundingClientRect();
      let { top: destTop, left: destLeft } = this.chessboard.getSquare(destinationSquare).getBoundingClientRect();
      this.style.position = "absolute";
      return this.animate([{ transform: `translateX(0px) translateY(0px)` }, { transform: `translateX(${destLeft - left}px) translateY(${destTop - top}px)` }], {
        duration: 100,
        iterations: 1,
      }).finished;
    }
  }
);

/*************************************************************************
   <chess-square defendedby="Qf5" attackedby="nc5"> Web Component
   */
customElements.define(
  "chess-square",
  class extends ChessBaseElement {
    // ======================================================== <chess-square>.observedAttributes
    static get observedAttributes() {
      return ["piece"]; // listen to attackedby attribute
    }

    // ======================================================== <chess-square>.constructor
    constructor() {
      super();
      this.attackedArray = [];
      this.defendedArray = [];
    }
    // ======================================================== <chess-square>.connectedCallback
    connectedCallback() {
      this.addEventListener("click", (event) => {
        const this_chessSquare = this;
        const { chessboard, piece: chessPiece, at } = this_chessSquare;
        const hasPiece = this.hasAttribute("piece");

        if (/* first click! */ !chessboard.pieceClicked) {
          if (hasPiece) {
            chessPiece.potentialMoves(at);
            chessboard.pieceClicked = this.piece; // Hier wordt pieceClicked pas gedefinieerd.
            console.log("Mogelijke zetten: ", chessboard.pieceClicked.moves);
          }
        } /* second click! */ else {
          if (/* piece on target or not, move piece */ chessboard.pieceClicked.moves.includes(at)) {
            chessboard.movePiece(chessboard.pieceClicked, at);
            chessboard.reduceCastlingArray();
            chessboard.castlingMove();
            if (this.piece.isPawnAtEnd()) {
              chessboard.takePiece().then((chosenPiece) => {
                console.log("chosenPiece:", chosenPiece, this);
                chessboard.addPiece(chosenPiece, this.piece.at);
                document.getElementById("message").innerText = "";
                this_chessSquare.clearAttributes();
                chessboard.changePlayer();
              });
            } else {
              this_chessSquare.clearAttributes();
              chessboard.changePlayer();
            }
          } else {
            delete chessboard.pieceClicked;
            chessboard.clearMoves();
          }
        }
      });
    }
    // ======================================================== <chess-square>.chessboard
    get chessboard() {
      return this.closest("chess-board");
    }
    // ======================================================== <chess-square>.at
    get at() {
      return this.getAttribute("at");
    }
    // ======================================================== <chess-square>.file
    get file() {
      return this.at[0];
    }
    // ======================================================== <chess-square>.rank
    get rank() {
      return this.at[1];
    }
    // ======================================================== <chess-square>.piece
    get piece() {
      return this.querySelector("chess-piece");
    }
    set piece(v) {}
    // ======================================================== <chess-square>.squareElement
    squareElement(squareName) {
      return this.chessboard.getSquare(squareName);
    }
    // ======================================================== <chess-square>.addPiece
    addPiece(piece) {
      let piece_name;
      if (typeof piece == "string") {
        piece_name = piece.length == 1 ? this.chessboard.FENconversion(piece) : piece;
        piece = document.createElement("chess-piece"); // create <chess-piece is="wit-koning" at="d5">
        piece.setAttribute("is", piece_name);
      } else {
        piece_name = piece.is;
      }
      this.clear();
      this.setAttribute("piece", piece_name);
      return this.appendChild(piece);
    }
    // ======================================================== <chess-square>.attackedBy
    attackedBy(chessPiece) {
      this.attackedArray.push(this.chessboard.FENconversion(chessPiece.is) + chessPiece.at);
      this.setAttribute("attackedby", this.attackedArray.join(","));
    }
    // ======================================================== <chess-square>.attackedBy
    defendedBy(chessPiece) {
      this.defendedArray.push(this.chessboard.FENconversion(chessPiece.is) + chessPiece.at);
      this.setAttribute("defendedby", this.defendedArray.join(","));
    }
    // ======================================================== <chess-square>.translate
    translate(x_move, y_move) {
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
      let color =
        {
          [__ATTACK_PIECE__]: "red",
          [__EMPTY_SQUARE__]: "green",
          [__PROTECT_PIECE__]: "orange",
        }[state] || "hotpink";
      if (state) {
        this.setAttribute("state", state);
        this.style.border = "5px solid " + color;
      } else {
        this.style.border = "";
        this.removeAttribute("state");
      }
    }
    // ======================================================== <chess-square>.clear
    clear() {
      this.removeAttribute("piece");
      this.style.border = "";
      this.innerHTML = "";
    }
    // ======================================================== <chess-square>.clearAttributes
    clearAttributes() {
      this.removeAttribute("attackedby");
      this.removeAttribute("defendedby");
      this.attackedArray = [];
      this.defendedArray = [];
    }
    // ======================================================== <chess-square>.capturePieceBy
    capturePieceBy(chessPiece = { is: "NO PIECE" }) {
      if (this.piece) {
        const capturedPiece = this.getAttribute("piece");
        console.log(chessPiece.is, "captured:", capturedPiece);
        if (this.piece.color === __PLAYER_BLACK__) {
          this.chessboard.capturedBlackPieces.push(capturedPiece);
          console.log("Captured Black Pieces:", this.chessboard.capturedBlackPieces);
        } else {
          this.chessboard.capturedWhitePieces.push(capturedPiece);
          console.log("Captured White Pieces:", this.chessboard.capturedWhitePieces);
        }
        this.clear();
        return capturedPiece;
      } else return false;
    }
    // ======================================================== <chess-square>.isDefendedBy
    isDefendedBy(color) {
      let defendedColor = "";
      function hasLowerCase(str) {
        return str.charAt(0) !== str.charAt(0).toUpperCase();
      }
      function hasUpperCase(str) {
        return str.charAt(0) === str.charAt(0).toUpperCase();
      }
      if (typeof this.defendedArray == "undefined") {
        return false;
      }
      if (this.defendedArray.every(hasLowerCase)) {
        defendedColor = __PLAYER_BLACK__;
      } else if (this.defendedArray.every(hasUpperCase)) {
        defendedColor = __PLAYER_WHITE__;
      }
      if (color !== defendedColor) {
        return true;
      } else {
        return false;
      }
    }
  }
);

/*************************************************************************
   <chess-board fen="" player="wit"> Web Component
   */
customElements.define(
  "chess-board",
  class extends ChessBaseElement {
    // ======================================================== <chess-board>.observedAttributes
    static get observedAttributes() {
      return ["fen"];
    }
    // ======================================================== <chess-board>.constructor
    constructor() {
      super();
      this.capturedBlackPieces = [];
      this.capturedWhitePieces = [];
    }
    // ======================================================== <chess-board>.connectedCallback
    connectedCallback() {
      // when this Component is added to the DOM, create the board with FEN and Arrays.
      this.createboard(this.getAttribute("template")); // id="Rob2"
      if (this.hasAttribute("fen")) {
        this.fen = this.getAttribute("fen");
      }
      this.moves = [];
      this.calculateBoard();
      this.clearMoves();
    }
    // ======================================================== <chess-board>.attributeChangedCallback
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue && name == "fen") {
        this.fen = newValue;
      }
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
        this.innerHTML = chessboard_innerHTML;
      }

      // instead of 'const' store the variables on the <chess-board> so ALL code can use it (in 2022)
      this.files = ["a", "b", "c", "d", "e", "f", "g", "h"]; // Kolommen
      this.ranks = ["8", "7", "6", "5", "4", "3", "2", "1"]; // Rijen
      this.squares = [];

      let gridareasHTML = "";
      let chess_squaresHTML = "";
      let fieldColor = true; // alternate white/black colors, a8 is white

      for (var rank = 0; rank < this.ranks.length; rank++) {
        for (var file = 0; file < this.files.length; file++) {
          const square = this.files[file] + this.ranks[rank]; // "a8"
          this.squares.push(square);

          gridareasHTML += `[at="${square}"] { grid-area: ${square} }`;

          let fieldClass = fieldColor ? "white_square" : "black_square";
          chess_squaresHTML += `<chess-square class="${fieldClass}" at="${square}"></chess-square>`;
          if (file < 7) fieldColor = !fieldColor; // alternate fieldColor white/black/white/black
        }
      }

      // the whole application works with the 1,2,3,4,5,6,7,8 Array
      this.ranks1to8 = this.ranks.reverse();

      this.queryBoard("#chessboard_gridareas").innerHTML = gridareasHTML;
      this.queryBoard("#chessboard_squares").innerHTML = chess_squaresHTML;
      this.queryBoard("#chessboard_pieces").innerHTML = userHTMLpieces;
      console.log(`created `, this);
    }
    // ======================================================== <chess-board>.getSquare
    getSquare(square) {
      // square can be "c5" OR a reference to <chess-square at="c5">
      // return reference to <chess-square at=" [position] ">
      if (typeof square === "string") return this.queryBoard(`[at="${square}"]`);
      else return square;
    }
    // ======================================================== <chess-board>.hasSquare
    hasSquare(square) {
      return this.squares.includes(square);
    }
    // ======================================================== <chess-board>.getPiece
    getPiece(square) {
      return this.getSquare(square).querySelector("chess-piece") || false;
    }
    // ======================================================== <chess-board>.addPiece
    addPiece(piece_name, at) {
      //if piecename is one FEN letter
      if (piece_name.length == 1) piece_name = this.FENconversion(piece_name);
      return this.getSquare(at).addPiece(piece_name);
    }
    // ======================================================== <chess-board>.clearSquare
    clearSquare(square) {
      // square can be "c5" OR a reference to <chess-square at="c5">
      this.getSquare(square).clear();
    }
    // ======================================================== <chess-board>.clear
    clear() {
      for (const square of this.squares) {
        this.clearSquare(square);
      }
    }
    // ======================================================== <chess-board>.changePlayer
    changePlayer(piece = this.pieceClicked) {
      this.calculateBoard();
      this.isInCheck();
      this.setAttribute("player", this.pieceClicked.color == __PLAYER_WHITE__ ? __PLAYER_BLACK__ : __PLAYER_WHITE__); // Naar FEN
      delete this.pieceClicked;
      this.clearMoves();
    }
    // ======================================================== <chess-board>.recordMove
    recordMove(chessPiece, fromSquare, toSquare) {
      let moveType = toSquare.capturePieceBy(chessPiece) ? __MOVETYPE_CAPTURE__ : __MOVETYPE_MOVE__;
      console.warn("recordMove", chessPiece, fromSquare.at, moveType, toSquare.at);
      this.moves.push({
        chessPiece,
        fromSquare,
        toSquare,
      });
      document.dispatchEvent(
        new CustomEvent(__STORECHESSMOVE__, {
          bubbles: true,
          composed: true,
          cancelable: false,
          detail: {
            chessboard: this,
            moves: this.moves,
            chessPiece,
            fromSquare,
            toSquare,
            moveType,
            // data send to API
            move: fromSquare.at + moveType + toSquare.at,
            fen: this.fen,
          },
        })
      );
    }
    // ======================================================== <chess-board>.movePiece
    movePiece(chessPiece, square) {
      if (typeof chessPiece == "string") chessPiece = this.getPiece(chessPiece); // convert "e2" to chessPiece IN e2
      chessPiece.animateTo(square).then((anim) => {
        // move piece to square
        let pieceName = chessPiece.getAttribute("is");
        let fromSquare = chessPiece.square;
        if (fromSquare) fromSquare.clear(); // if the piece is already on a square, remove it from that square

        let toSquare = this.getSquare(square);

        toSquare.setAttribute("piece", pieceName);
        if (this.lastMove) {
          if (toSquare.at == this.lastMove.enPassantPosition && pieceName.includes("pion")) {
            console.log("We had En Passant. Clear piece.");
            this.clearSquare(this.lastMove.toSquare);
          }
        }
        this.recordMove(chessPiece, fromSquare, toSquare);
        this.lastMove.enPassantPosition = this.enPassantPosition(this.lastMove); // Was er een en passant square van een pion?
        // console.warn(this.moves);
        return toSquare.appendChild(chessPiece);
      });
    }
    // ======================================================== <chess-board>.clearMoves
    clearMoves() {
      for (let element of this.squares) {
        let chessSquare = this.getSquare(element);
        chessSquare.highlight(false);
      }
    }
    // ======================================================== <chess-board>.calculateBoard
    // calculateBoard wordt aangeroepen in einde Click-event.
    calculateBoard() {
      for (const square of this.squares) this.getSquare(square).clearAttributes();
      for (const square of this.squares) {
        let piece = this.getPiece(square);
        if (piece) {
          piece.potentialMoves();
        }
      }
    }
    // ======================================================== <chess-board>.lastPawnMove
    enPassantPosition(lastMove) {
      const piece = lastMove.chessPiece.is;
      const fromSquare = lastMove.fromSquare;
      const toSquare = lastMove.toSquare;
      if (piece.includes("pion") && Math.abs(toSquare.rank - fromSquare.rank) == 2) {
        let position = "";
        if (piece.includes(__PLAYER_WHITE__)) position = fromSquare.file + "3";
        else position = fromSquare.file + "6";
        console.log("En passant positie", position);
        // addPositionToFEN();
        return position;
      }
    }
    // ======================================================== <chess-board>.lastMove
    get lastMove() {
      if (this.moves) {
        if (this.moves.length) {
          return this.moves.slice(-1)[0];
        }
      }
    }
    // ======================================================== <chess-board>.castlingInterrupt
    // False: Castling impossible
    castlingInterrupt(color, offset) {
      let kingPosition = "";
      if (color == __PLAYER_WHITE__) {
        kingPosition = this.getSquare("e1");
      } else if (color == __PLAYER_BLACK__) {
        kingPosition = this.getSquare("e8");
      }
      if (offset < 0) {
        for (let i = -1; i >= offset; i--) {
          let squareName = kingPosition.translate(i, 0);
          let squareElement = this.getSquare(squareName);
          if (squareElement.isDefendedBy(color) == true) {
            return false;
          }
        }
      } else if (offset > 0) {
        for (let i = 1; i <= offset; i++) {
          let squareName = kingPosition.translate(i, 0);
          let squareElement = this.getSquare(squareName);
          if (squareElement.isDefendedBy(color) == true) {
            return false;
          }
        }
      }
      return true; // Castling possible
    }
    // ======================================================== <chess-board>.reduceCastlingArray
    reduceCastlingArray() {
      const lastReduceMove = this.lastMove.fromSquare.at;
      if (lastReduceMove == "a1") {
        this.castlingArray = this.castlingArray.filter((item) => item !== "Q");
      } else if (lastReduceMove == "h1") {
        this.castlingArray = this.castlingArray.filter((item) => item !== "K");
      } else if (lastReduceMove == "a8") {
        this.castlingArray = this.castlingArray.filter((item) => item !== "q");
      } else if (lastReduceMove == "h8") {
        this.castlingArray = this.castlingArray.filter((item) => item !== "k");
      } else if (lastReduceMove == "e1") {
        this.castlingArray = this.castlingArray.filter((item) => item !== "Q" && item !== "K");
      } else if (lastReduceMove == "e8") {
        this.castlingArray = this.castlingArray.filter((item) => item !== "q" && item !== "k");
      }
    }
    // ======================================================== <chess-board>.castlingMove
    castlingMove() {
      if (this.lastMove.chessPiece.is.endsWith("koning") && this.lastMove.fromSquare.at == "e1") {
        if (this.lastMove.toSquare.at == "c1") {
          this.movePiece(this.getPiece(this.getSquare("a1")), "d1");
        } else if (this.lastMove.toSquare.at == "g1") {
          this.movePiece(this.getPiece(this.getSquare("h1")), "f1");
        }
      } else if (this.lastMove.chessPiece.is.endsWith("koning") && this.lastMove.fromSquare.at == "e8") {
        if (this.lastMove.toSquare.at == "c8") {
          this.movePiece(this.getPiece(this.getSquare("a8")), "d8");
        } else if (this.lastMove.toSquare.at == "g8") {
          this.movePiece(this.getPiece(this.getSquare("h8")), "f8");
        }
      }
    }

    // ======================================================== <chess-board>.takePiece
    takePiece() {
      document.getElementById("message").innerText = "Kies een stuk (toets letter in): Q, N, R, B.";
      const thisPawn = this.lastMove.chessPiece;
      const color = thisPawn.color;
      const eventName = "keydown";
      return new Promise((resolve) => {
        const choosePiece = (evt) => {
          let chosenPiece = "";
          window.removeEventListener(eventName, choosePiece);
          switch (evt.key) {
            case "q":
              chosenPiece = `${color}-koningin`;
              break;
            case "n":
              chosenPiece = `${color}-paard`;
              break;
            case "r":
              chosenPiece = `${color}-toren`;
              break;
            case "b":
              chosenPiece = `${color}-loper`;
              break;
            default:
              return;
          }
          resolve(chosenPiece);
        };
        window.addEventListener(eventName, choosePiece);
      });
    }
    // ======================================================== <chess-board>.findPiece
    findPiece(piece) {
      for (const square of this.squares) {
        const specificPiece = this.getSquare(square).piece;
        if (specificPiece && specificPiece.is == piece) {
          return this.getSquare(square);
        }
      }
    }
    // ======================================================== <chess-board>.check
    isInCheck() {
      const whiteKingSquare = this.findPiece("wit-koning");
      const blackKingSquare = this.findPiece("zwart-koning");
      if (whiteKingSquare.getAttribute("attackedBy")) {
        console.log("Witte koning staat schaak door ", whiteKingSquare.getAttribute("attackedBy"));
        const whiteInCheck = true;
      }
      if (blackKingSquare.getAttribute("attackedBy")) {
        console.log("Zwarte koning staat schaak door ", blackKingSquare.getAttribute("attackedBy"));
        const blackInCheck = true;
      }
    }
    // ======================================================== <chess-board>.check-mate
    // Game over. White wins or Black wins.

    // ======================================================== <chess-board>.stalemate
    // Game over. Gelijkspel. Patstelling.

    // ======================================================== <chess-board>.FENconversion
    FENconversion(name) {
      if (!this._FENConversionMap) {
        /* create a lookup Map ONCE to lookup BOTH letters OR piecename
          "R" -> "wit-toren"
          "wit-toren" -> "R" */
        this._FENConversionMap = new Map(); // see MDN documentation
        let FENletters = "RNBQKPrnbqkp".split(""); // create an array of letters
        [__PLAYER_WHITE__, __PLAYER_BLACK__].map((color) =>
          ["toren", "paard", "loper", "koningin", "koning", "pion"].map((name) => {
            let piece = color + "-" + name;
            let letter = FENletters.shift(); // remove first letter from array
            this._FENConversionMap.set(piece, letter);
            this._FENConversionMap.set(letter, piece);
          })
        );
      }
      // return R or wit-toren
      return this._FENConversionMap.get(name);
    }
    // ======================================================== <chess-board>.fen SETTER/GETTER
    set fen(fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {
      this.castlingArray = ["K", "Q", "k", "q"]; // Halen we uit FEN
      // make sure we don't run before the board exists, because attributeChangedCallback runs early
      if (this.squares) {
        this.clear();
        if (fenString !== "") {
          let squareIndex = 0;
          fenString.split("").map((piece) => {
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
        document.querySelector("#fen").value = fenString;
      }
      // documentatie van class Methods en Properties in console.log
      this.docs(this);
      this.docs(this.querySelector("chess-square"));
      this.docs(this.querySelector("chess-piece"));
      // this.calculateBoard();
    }
    // ======================================================== <chess-board>.fen SETTER/GETTER

    get fen() {
      let fenString = "";
      let empty = 0;
      for (var rank = 7; rank >= 0; rank--) {
        for (var file = 0; file < this.files.length; file++) {
          const square = this.files[file] + this.ranks[rank]; // "a8"
          const piece = this.getPiece(square);
          console.log(this.rank);
          if (piece) {
            const fenPiece = this.FENconversion(piece.getAttribute("is"));
            if (empty != 0) {
              fenString = fenString + empty;
              empty = 0;
            }
            fenString = fenString + fenPiece;
          } else {
            empty++;
          }
        }
        if (rank < 8) {
          if (empty != 0) {
            fenString = fenString + empty;
            empty = 0;
          }
          if (rank > 0) fenString = fenString + "/";
        }
      }
      console.log(fenString);
      return fenString;
    }
  }
);
