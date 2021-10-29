/*
    <schaak-stuk is="wit-paard" at="D5"> Web Component
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
    movePieceTo(to_at) {
      this.closest("chess-board").movePiece(this, to_at);
    }
    get is() {
      return this.getAttribute("is");
    }
    set is(value) {
      this.setAttribute("is", value);
    }
  }
);

/*
 <schaak-bord> Web Component
*/
customElements.define(
  "chess-board",
  class extends HTMLElement {
    connectedCallback() {
      // when this Component is added to the DOM, create the board
      setTimeout(() => {
        // we need a settimeout out to check if the user has already added HTML <chess-piece>s
        this.createboard(this.getAttribute("template")); // id="Rob2"
      });
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

      this.querySelectorBoard("#chessboard_gridareas").innerHTML =
        gridareasHTML;
      this.querySelectorBoard("#chessboard_squares").innerHTML =
        chess_squaresHTML;
      this.querySelectorBoard("#chessboard_pieces").innerHTML = userHTMLpieces;
      console.log(`created board ${this.id}`);
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
      if (piece_name.length == 1) {
        piece_name = this.FENconversion(piece_name);
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
        console.warn(pieceName, "captured:", toSquare.getAttribute("piece"));
        this.clearSquare(toSquare);
      }
      toSquare.setAttribute("piece", pieceName);
      return toSquare.appendChild(chessPiece);
    }
    // ======================================================== <chess-board>.move
    move(fromsquare, tosquare) {
      // TODO: move piece from fromsquare to tosquare
    }
    // ======================================================== <chess-board>.FENconversion
    FENconversion(name) {
      if (!this._FENConversionMap) {
        /* create a lookup Map ONCE 
        to lookup BOTH letters OR piecename
        "R" -> "wit-toren"
        "wit-toren" -> "R"
        */
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
    // ======================================================== <chess-board>.fen GETTER/SETTER
    set fen(fenstring = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {}
    get fen() {
      // return fen string
    }
  }
);
