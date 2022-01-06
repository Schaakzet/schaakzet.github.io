console.log("load schaakzet.js");

// used to highlight the moves a chesspiece can make
const __PROTECT_PIECE__ = "p";
const __ATTACK_PIECE__ = "x";
const __EMPTY_SQUARE__ = "e";

const chessboardHTML = `
<style id="chessboard_definition">
chess-board {
  --width: 80vw;
  width: var(--width);
  height: var(--width);
  /* display <chess-board> as blocks next to eachother */
  display: inline-block;
  /* all my child elements are relative to my size */
  position: relative;
  border: calc(var(--width) / 40) solid gray;
}
.chessboard_layer {
  /* position multiple layers on top of eachother */
  position: absolute;
  /* width/height is 100% of <chess-board> */
  width: 100%;
  height: 100%;
  /* display all elements inside a layer in a 8x8 grid */
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
    "a1 b1 c1 d1 e1 f1 g1 h1";
}
.chessboard_layer:empty {
  /* hide empty layers */
  display: none;
}
chess-square {
  /* keep the square square no matter what is put inside it */
  overflow: hidden;
  max-height: 100%;
}
.black_square {
  background-color: darkgray;
}

.white_square {
  background-color: white;
}
chess-piece > * {
  width: 100%;
  position: relative;
}
</style>
<style id="squarelabels">
chess-square:after {
  content: attr(at);
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}
</style>
<!-- Deze 64 grid-area definities gaan we maken met de Array squares = [ "A8","B8","C8", ... , "G1" , "H1" ] -->
<style id="chessboard_gridareas">
/* deze innerHTML wordt vervangen door 64 velddefinities:
          [at="a8"] {
              grid-area: a8;
          }
  */
</style>
<div id="chessboard_squares" class="chessboard_layer">
<!-- squares JS loop maakt 64 velden:
      <div class="white_square" at="a8">a8</div>
      <div class="black_square" at="b8">b8</div>
        -->
</div>
<div id="chessboard_pieces" class="chessboard_layer"></div>
`;

// moves for all pieces
const __HORSEMOVES__ = [
  [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ],
];
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
const __KINGMOVES__ = [
  [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ],
];
/*************************************************************************
    <chess-piece is="wit-paard" at="D5"> Web Component
*/
customElements.define(
  "chess-piece",
  class extends HTMLElement {
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
    // ======================================================== <chess-piece>.at
    get at() {
      return this.closest("chess-square").getAttribute("at");
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
    // ======================================================== <chess-piece>.possibleMove
    possibleMove = (x_move = 0, y_move = 0) => {
      const files = this.chessboard.files;
      const ranks = this.chessboard.ranks;
      const fromSquare = this.at;
      const x = files.indexOf(fromSquare[0]);
      const y = ranks.indexOf(fromSquare[1]);
      const toFile = files[x + x_move];
      const toRank = ranks[y + y_move];
      // both need to be defined
      if (toFile && toRank) {
        return toFile + toRank; // example: "d5"
      } else {
        return false;
      }
    };
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
      } else if (this.is === "wit-pion") {
        pieceMoves = [[[0, 1]]];
      } else if (this.is === "zwart-pion") {
        pieceMoves = [[[0, -1]]];
      }
      return pieceMoves;
    }
    // ======================================================== <chess-piece>.potentialMoves
    potentialMoves() {
      // De array potentialArray is alle mogelijkheden van possibleMove.
      console.log("check potentialMoves:", this.is, " on ", this.at);
      let potentialMovesArray = [];
      let pieceMoves = this.pieceMoves;
      for (let line = 0; line < pieceMoves.length; line++) {
        for (let move = 0; move < pieceMoves[line].length; move++) {
          let xAxis = pieceMoves[line][move][0]; // get x movement
          let yAxis = pieceMoves[line][move][1]; // get y movement
          let squareName = this.possibleMove(xAxis, yAxis);
          if (squareName) {
            const squareElement = this.chessboard.getSquare(squareName); // get <chess-square> element
            console.log(
              squareName,
              "line:" + line,
              "move:" + move,
              squareName,
              squareElement.piece?.is || "leeg"
            );
            // Eerst kijken of er een piece staat, en dan kijken of het dezelfde kleur heeft.
            if (squareElement.piece) {
              if (this.color === squareElement.piece.color) {
                squareElement.highlight(__PROTECT_PIECE__);
                break; // Sandro created a logical bug here! try horse on D5
              } else {
                // Als het een andere kleur heeft, potentialMove!
                //console.log(this.color, squareElement.piece.color);
                squareElement.highlight(__ATTACK_PIECE__);
                potentialMovesArray.push(squareName);
                break; // Sandro created a logical bug here! try horse on D5
              }
            }
            squareElement.highlight(__EMPTY_SQUARE__);
            potentialMovesArray.push(squareName);
          } else {
            // move is outside board
          }
        } // for j
      } // for i
      return potentialMovesArray;
    }
  }
);

customElements.define(
  "chess-square",
  class extends HTMLElement {
    // ======================================================== <chess-square>.connectedCallback
    connectedCallback() {
      this.addEventListener("click", (event) => {
        let chessboard = this.closest("chess-board");
        console.log(this, chessboard.pieceClicked);
        if (this.hasAttribute("piece")) {
          // move piece if pieceClicked
          if (chessboard.pieceClicked) {
            chessboard.movePiece(
              chessboard.pieceClicked,
              this.getAttribute("at")
            );
            delete chessboard.pieceClicked;
          } else {
            chessboard.pieceClicked = this.querySelector("chess-piece"); // Hier wordt pieceClicked pas gedefinieerd.
          }
        } else {
          // move piece if pieceClicked
          if (chessboard.pieceClicked) {
            chessboard.movePiece(
              chessboard.pieceClicked,
              this.getAttribute("at")
            );
            delete chessboard.pieceClicked;
          }
        }
      });
    }
    // ======================================================== <chess-square>.piece
    get piece() {
      return this.querySelector("chess-piece");
    }
    set piece(piece) {}
    // ======================================================== <chess-square>.highlight
    highlight(state = false) {
      let color =
        {
          [__ATTACK_PIECE__]: "red",
          [__EMPTY_SQUARE__]: "green",
          [__PROTECT_PIECE__]: "orange",
        }[state] || "hotpink";
      if (state) {
        this.style.border = "5px solid " + color;
      } else this.style.border = "";
    }
    // ======================================================== <chess-square>.clear
    clear() {
      this.removeAttribute("piece");
      this.style.border;
      this.innerHTML = "";
    }
  }
);

/*************************************************************************
   <chess-board> Web Component
   */
customElements.define(
  "chess-board",
  class extends HTMLElement {
    // ======================================================== <chess-board>.observedAttributes
    static get observedAttributes() {
      return ["fen"];
    }
    // ======================================================== <chess-board>.connectedCallback
    connectedCallback() {
      // when this Component is added to the DOM, create the board
      // setTimeout(() => {
      // we need a settimeout out to check if the user has already added HTML <chess-piece>s
      this.createboard(this.getAttribute("template")); // id="Rob2"
      if (this.hasAttribute("fen")) {
        this.fen = this.getAttribute("fen");
      }
      // });
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
        this.innerHTML = chessboardHTML;
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
      this.ranks = this.ranks.reverse();

      this.queryBoard("#chessboard_gridareas").innerHTML = gridareasHTML;
      this.queryBoard("#chessboard_squares").innerHTML = chess_squaresHTML;
      this.queryBoard("#chessboard_pieces").innerHTML = userHTMLpieces;
      console.log(`created `, this);
    }
    // ======================================================== <chess-board>.getSquare
    getSquare(square) {
      // square can be "c5" OR a reference to <chess-square at="c5">
      // return reference to <chess-square at=" [position] ">
      if (typeof square === "string")
        return this.queryBoard(`[at="${square}"]`);
      else return square;
    }
    // ======================================================== <chess-board>.getPiece
    getPiece(square) {
      return this.getSquare(square).querySelector("chess-piece") || false;
    }
    // ======================================================== <chess-board>.addPiece
    addPiece(piece_name, at) {
      //if piecenname is one FEN letter
      if (piece_name.length == 1) piece_name = this.FENconversion(piece_name);
      // clear existing square
      this.clearSquare(at);
      // create <chess-piece is="wit-koning" at="d5">
      let newpiece = document.createElement("chess-piece");
      newpiece.setAttribute("is", piece_name);
      return this.movePiece(newpiece, at);
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
    // ======================================================== <chess-board>.movePiece
    movePiece(chessPiece, square) {
      // move piece to square
      let pieceName = chessPiece.getAttribute("is");
      let fromSquare = chessPiece.closest("chess-square");
      if (fromSquare != null) {
        // if the piece is already on a square, remove it from that square
        this.clearSquare(fromSquare);
      }
      let toSquare = this.getSquare(square);
      if (toSquare.hasAttribute("piece")) {
        console.log(pieceName, "captured:", toSquare.getAttribute("piece"));
        this.clearSquare(toSquare);
      }
      toSquare.setAttribute("piece", pieceName);
      //console.log("movePiece", pieceName, "to", square);
      return toSquare.appendChild(chessPiece);
    }
    // ======================================================== <chess-board>.hasSquare
    hasSquare(square) {
      return this.squares.includes(square);
    }
    // ======================================================== <chess-board>.showmoves
    showmoves(square) {
      let piece = this.getPiece(square);
      if (piece) piece.potentialMoves();
      else console.log("square " + square, "has no piece");
    }
    // ======================================================== <chess-board>.move
    move(fromsquare, tosquare) {
      // TODO: move piece from fromsquare to tosquare
      // if move is potentialMove, move().
    }
    // ======================================================== <chess-board>.FENconversion
    FENconversion(name) {
      if (!this._FENConversionMap) {
        /* create a lookup Map ONCE to lookup BOTH letters OR piecename
        "R" -> "wit-toren"
        "wit-toren" -> "R" */
        this._FENConversionMap = new Map(); // see MDN documentation
        let FENletters = "RNBQKPrnbqkp".split(""); // create an array of letters
        ["wit", "zwart"].map((color) =>
          ["toren", "paard", "loper", "koningin", "koning", "pion"].map(
            (name) => {
              let piece = color + "-" + name;
              let letter = FENletters.shift(); // remove first letter from array
              this._FENConversionMap.set(piece, letter);
              this._FENConversionMap.set(letter, piece);
            }
          )
        );
      }
      // return R or wit-toren
      return this._FENConversionMap.get(name);
    }
    // ======================================================== <chess-board>.fen SETTER/GETTER
    set fen(fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {
      // make sure we don't run before the board exists, because attributeChangedCallback runs early
      if (this.squares) {
        if (fenString == "") {
          this.clear();
        } else {
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
        document.querySelector("#fen") && (document.querySelector("#fen").value = fenString);
      }
    }
    // ======================================================== <chess-board>.fen SETTER/GETTER

    get fen() {
      let fenString = "";
      let empty = 0;
      for (var rank = 0; rank < this.ranks.length; rank++) {
        for (var file = 0; file < this.files.length; file++) {
          const square = this.files[file] + this.ranks[rank]; // "a8"
          const piece = this.getPiece(square);
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
          if (rank < 7) fenString = fenString + "/";
        }
      }
      console.log(fenString);
      return fenString;
    }
    // ======================================================== <chess-board>.playerTurn
    // turnWhite = true;
    // if piece on fromSquare = "zwart" then !move();
    // changeTurn() => after move() turnWhite = !turnWhite
  }
);
