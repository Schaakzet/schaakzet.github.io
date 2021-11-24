//console.log("execute webcomponents.js");
/*************************************************************************
    <chess-piece is="wit-paard" at="D5"> Web Component
*/
customElements.define(
  "chess-piece",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["is"]; // listen to is attribute
    }
    attributeChangedCallback(name, oldValue, newValue) {
      // if is attribute changed, render new image
      this.innerHTML = `<img src="https://schaakzet.github.io/img/${newValue}.png">`;
    }
    movePieceTo(at) {
      this.chessboard.movePiece(this, at);
    }

    get chessboard() {
      return this.closest("chess-board");
    }

    get at() {
      return this.closest("chess-square").getAttribute("at");
    }
    set at(at) {
      this.chessboard.movePiece(this, at);
    }
    get is() {
      return this.getAttribute("is");
    }
    set is(value) {
      this.setAttribute("is", value);
    }
    get color() {
      const indexStreepje = this.is.indexOf("-");
      return this.is.slice(0, indexStreepje);
    }
    potentialMoves() {
      // De array potentialArray is alle mogelijkheden van possibleMove.
      console.log(this.is, this.at);
      const chessboard = this.chessboard;
      const fromSquare = this.at;

      const possibleMove = (x_move, y_move) => {
        const files = chessboard.files;
        const ranks = chessboard.ranks;

        const x = files.indexOf(fromSquare[0]);
        const y = ranks.indexOf(fromSquare[1]);

        // console.log(this.is, fromSquare, files, ranks, x, y, x_move, y_move)

        return files[x + x_move] + ranks[y + y_move];
      };

      let axesTranslate;
      if (this.is.includes("paard")) {
        axesTranslate = [
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
      } else if (this.is.includes("loper")) {
        axesTranslate = [
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
      } else if (this.is.includes("toren")) {
        axesTranslate = [
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
      } else if (this.is.includes("koningin")) {
        axesTranslate = [
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
      } else if (this.is.includes("koning")) {
        axesTranslate = [
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
      } else if (this.is === "wit-pion") {
        axesTranslate = [[[0, 1]]];
      } else if (this.is === "zwart-pion") {
        axesTranslate = [[[0, -1]]];
      }

      const potentialArray = [];

      for (let i = 0; i < axesTranslate.length; i++) {
        for (let j = 0; j < axesTranslate[i].length; j++) {
          let xAxis = axesTranslate[i][j][0]; // Van de i-de axesTranslate en de j-de array, pak de x-coordinaat
          let yAxis = axesTranslate[i][j][1]; // Van de i-de axesTranslate en de j-de array, pak de y-coordinaat
          let potentialMove = possibleMove(xAxis, yAxis);
          if (chessboard.squares.includes(potentialMove)) {
            const square = chessboard.getSquare(potentialMove);
            console.log(potentialMove, square);
            // Eerst kijken of er een piece staat, en dan kijken of het dezelfde kleur heeft.
            if (square.hasAttribute("piece")) {
              let pieceInSquare = square.querySelector("chess-piece");
              if (this.color === pieceInSquare.color) {
                break;
              } else {
                // Als het een andere kleur heeft, potentialMove! 
                console.log(this.color, pieceInSquare.color);
                square.highlight(true);
                potentialArray.push(potentialMove);
                break;
              }
            }
            square.highlight(true);
            potentialArray.push(potentialMove);
          }
        }
        console.log(axesTranslate[i]);
      }
      console.log(potentialArray);
    }
  }
);

customElements.define(
  "chess-square",
  class extends HTMLElement {
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
    highlight(state = false) {
      if (state) {
        this.style.border = "5px solid green";
      } else this.style.border = "";
    }
  }
);

/*************************************************************************
 <chess-board> Web Component
*/
customElements.define(
  "chess-board",
  class extends HTMLElement {
    connectedCallback() {
      // when this Component is added to the DOM, create the board
      // setTimeout(() => {
      // we need a settimeout out to check if the user has already added HTML <chess-piece>s
      this.createboard(this.getAttribute("template")); // id="Rob2"
      // });
    }
    // ======================================================== <chess-board>.querySelectorBoard
    querySelectorBoard(selector) {
      // this is so we are ready for future error checking and enhancements
      return this.querySelector(selector);
    }
    // ======================================================== <chess-board>.createboard
    createboard(name) {
      let userHTMLpieces = this.innerHTML;
      this.innerHTML = ""; // delete all userPieces, we will put them in another layer later

      // use the <template id=" [name] "> from the HTML document
      let templ = document.querySelector(`template[id="${name}"]`).content;
      this.append(templ.cloneNode(true));

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

      this.ranks = this.ranks.reverse(); // Nu willen we WEL van 1 tot en met 8 werken!!!

      this.querySelectorBoard("#chessboard_gridareas").innerHTML =
        gridareasHTML;
      this.querySelectorBoard("#chessboard_squares").innerHTML =
        chess_squaresHTML;
      this.querySelectorBoard("#chessboard_pieces").innerHTML = userHTMLpieces;
      console.log(`created `, this);
    }
    // ======================================================== <chess-board>.getSquare
    getSquare(square) {
      // square can be "c5" OR a reference to <chess-square at="c5">
      // return reference to <chess-square at=" [position] ">
      if (typeof square === "string")
        return this.querySelectorBoard(`[at="${square}"]`);
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
      // create <chess-piece is="wit-koning" at="d5">
      let newpiece = document.createElement("chess-piece");
      newpiece.setAttribute("is", piece_name);
      return this.movePiece(newpiece, at);
    }
    // ======================================================== <chess-board>.clearSquare
    clearSquare(square) {
      // square can be "c5" OR a reference to <chess-square at="c5">
      square = this.getSquare(square);
      square.removeAttribute("piece");
      square.innerHTML = "";
    }
    // ======================================================== <chess-board>.clear
    clear() {
      // zo kan het ook: this.squares.map(square => this.clearSquare(square));
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
