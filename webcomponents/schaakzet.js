// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  // V18.js - Check, checkmate and stalemate

  // V18a - 20 Feb: major clean up code
  // added todo comments (use VSCode plugin to color them orange)
  // prepared for using <chess-match> (in another JS file) and match.html
  // added call to database API in match.html

  // TODO: remove blinking cursor from gameboard

  const https_location = "https://schaakzet.github.io";
  const https_location_img = https_location + "/img/";

  // ********************************************************** Helper functions
  function HTML_ImageChessPiece(name) {
    return `<img src="${https_location_img}${name}.png">`;
  }
  function isString(value) {
    return typeof value === "string" || value instanceof String;
  }

  // ********************************************************** HTML CSS
  // TODO: create as attribute and property on <chess-board> so user can select theme colors
  const __CLASSNAME_WHITESQUARE__ = "white_square";
  const __CLASSNAME_BLACKSQUARE__ = "black_square";

  // ********************************************************** Web Component Strings
  const __WC_CHESS_PIECE__ = "chess-piece";
  const __WC_CHESS_SQUARE__ = "chess-square";
  const __WC_CHESS_BOARD__ = "chess-board";
  // Web Component attributes
  const __WC_ATTRIBUTE_AT__ = "at"; // <chess-square at="a8" piece="wit-koning">
  const __WC_ATTRIBUTE_PIECENAME__ = "piece"; // <chess-square piece="wit-koning">
  const __WC_ATTRIBUTE_IS__ = "is"; // <chess-piece is="wit-koning">
  const __WC_ATTRIBUTE_FEN__ = "fen"; // FEN notation
  const __WC_ATTRIBUTE_RECORD__ = "record"; // <chess-board record> triggers saving moves to database
  const __WC_ATTRIBUTE_PLAYER__ = "player"; // <chess-board player=" __PLAYER_WHITE__ / __PLAYER_BLACK__ ">

  // ********************************************************** Eventname constants in all chess files
  const __STORECHESSMOVE__ = "STORECHESSMOVE"; // send to <chess-match>

  // ********************************************************** Chess Game constants
  // chess constants
  const __FILES__ = "abcdefgh".split("");
  const __RANKS__ = "12345678".split("");
  const __SQUARE_TOP_LEFT__ = "a8";
  const __SQUARE_TOP_RIGHT__ = "h8";
  const __SQUARE_BOTTOM_LEFT__ = "a1";
  const __SQUARE_BOTTOM_RIGHT__ = "h1";
  const __SQUARE_WHITE_KING_START__ = "e1";
  const __SQUARE_BLACK_KING_START__ = "e8";

  const __PROTECT_PIECE__ = "p"; // used to highlight the moves a chesspiece can make
  const __ATTACK_PIECE__ = "x"; // used to highlight the moves a chesspiece can make
  const __EMPTY_SQUARE__ = "e"; // used to highlight the moves a chesspiece can make
  const __MOVETYPE_MOVE__ = "-"; // used in move notation
  const __MOVETYPE_CAPTURE__ = __ATTACK_PIECE__; // used in move notation

  const __PLAYER_WHITE__ = "wit"; // used as player color AND chesspiece names
  const __PLAYER_BLACK__ = "zwart"; // used as player color AND chesspiece names
  const __PIECE_SEPARATOR__ = "-"; //
  const __PIECE_KING__ = "koning"; // piecenames used as chesspiece filenames
  const __PIECE_PAWN__ = "pion";
  const __PIECE_ROOK__ = "toren";
  const __PIECE_QUEEN__ = "koningin";
  const __PIECE_KNIGHT__ = "paard";
  const __PIECE_BISHOP__ = "loper";

  const __PIECE_WHITE_PAWN__ = __PLAYER_WHITE__ + __PIECE_SEPARATOR__ + __PIECE_PAWN__;
  const __PIECE_BLACK_PAWN__ = __PLAYER_BLACK__ + __PIECE_SEPARATOR__ + __PIECE_PAWN__;

  const __PLAYER_COLORS__ = [__PLAYER_WHITE__, __PLAYER_BLACK__];
  const __PIECE_NAMES__ = [__PIECE_ROOK__, __PIECE_KNIGHT__, __PIECE_BISHOP__, __PIECE_QUEEN__, __PIECE_KING__, __PIECE_PAWN__];

  const __MOVEPIECE_ANIMATION_DURATION__ = 500;

  const otherPlayer = (color) => (color == __PLAYER_WHITE__ ? __PLAYER_BLACK__ : __PLAYER_WHITE__);

  // ********************************************************** Square functions
  const translateSquare = (square, file_offset, file_rank) => {
    // TODO: ("b2", 1, 1) -> "c3"
    // TODO: ("b2", -1, -1) -> "a1"
  };

  // ********************************************************** FEN
  const __FEN_WHITE_KING__ = "K";
  const __FEN_BLACK_KING__ = "k";
  const __FEN_WHITE_TOWER__ = "R";
  const __FEN_BLACK_TOWER__ = "r";
  const __FEN_WHITE_QUEEN__ = "Q";
  const __FEN_BLACK_QUEEN__ = "q";
  // create a lookup Map ONCE to lookup BOTH letters OR piecename
  // "R" -> "wit-toren"
  // "wit-toren" -> "R"
  let FENMap = new Map(); // see MDN Map documentation
  let FENletters = "RNBQKPrnbqkp".split(""); // create an array of letters
  __PLAYER_COLORS__.forEach((color) =>
    __PIECE_NAMES__.forEach((name) => {
      let piece = color + __PIECE_SEPARATOR__ + name;
      let letter = FENletters.shift(); // remove first letter from array
      FENMap.set(piece, letter);
      FENMap.set(letter, piece);
    })
  );
  const convertFEN = (name) => FENMap.get(name); // return R or wit-toren

  // ********************************************************** Chess BaseElement for <chess-board>,<chess-square>,<chess-piece>
  class ChessBaseElement extends HTMLElement {
    // ======================================================== BaseElement.docs
    // List methods and properties of a Component in the console
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
    // ======================================================== <chess-*>.at
    // returns square location "b8"
    get at() {
      if (this.localName == __WC_CHESS_PIECE__) {
        return this.square.getAttribute(__WC_ATTRIBUTE_AT__);
      } else {
        return this.getAttribute(__WC_ATTRIBUTE_AT__);
      }
    }
    set at(at) {
      if (this.localName == __WC_CHESS_PIECE__) {
        this.chessboard.movePiece(this, at);
      } else {
        console.error("Can't set at on", this);
      }
    }
    // ======================================================== <chess-*>.atFile
    atFile(file) {
      return this.at[0] == file;
    }
    // ======================================================== <chess-*>.atRank
    atRank(rank) {
      return this.at[1] == rank;
    }
    // ======================================================== <chess-*>.file
    get file() {
      return this.at[0];
    }
    // ======================================================== <chess-*>.rank
    get rank() {
      return this.at[1];
    }
    // ======================================================== <chess-*>.chessboard
    get chessboard() {
      return this.closest(__WC_CHESS_BOARD__);
    }
    // ======================================================== <chess-*>.square
    get square() {
      return this.closest(__WC_CHESS_SQUARE__);
    }
  }
  // ********************************************************** CSS and HTML for <chess-board>
  const squareStateCSS = (player) => /*css*/ `chess-board[player="${player}"] 
  chess-square[piece*="${otherPlayer(player)}"]:not([state="x"]){
    pointer-events:none;
    background: ${player == __PLAYER_WHITE__ ? "lightblue" : "lightgreen"}}`;

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

  // ********************************************************** translate moves for all pieces */
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

  // ********************************************************** class Player
  class Player {
    constructor(color) {
      console.log("New Player", color);
    }
  }
  // ********************************************************** <chess-piece is="wit-paard" at="D5"> Web Component
  customElements.define(
    __WC_CHESS_PIECE__,
    class extends ChessBaseElement {
      // ======================================================== <chess-piece>.observedAttributes
      static get observedAttributes() {
        return [__WC_ATTRIBUTE_IS__]; // listen to is attribute
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
        return this.getAttribute(__WC_ATTRIBUTE_IS__);
      }
      set is(value) {
        this.setAttribute(__WC_ATTRIBUTE_IS__, value);
      }
      // ======================================================== <chess-piece>.pieceName
      get pieceName() {
        return this.is;
      }
      // ======================================================== <chess-piece>.color
      get color() {
        const indexStreepje = this.is.indexOf(__PIECE_SEPARATOR__);
        return this.is.slice(0, indexStreepje);
      }
      // ======================================================== <chess-piece>.isWhite
      get isWhite() {
        return this.color == __PLAYER_WHITE__;
      }
      // ======================================================== <chess-piece>.isBlack
      get isBlack() {
        return this.color == __PLAYER_BLACK__;
      }
      // ======================================================== <chess-piece>.isPawn
      get isPawn() {
        return this.isPiece(__PIECE_PAWN__);
      }
      // ======================================================== <chess-piece>.isWhitePawn
      get isWhitePawn() {
        return this.is == __PLAYER_WHITE__ + __PIECE_SEPARATOR__ + __PIECE_PAWN__;
      }
      // ======================================================== <chess-piece>.isWhitePawn
      get isBlackPawn() {
        return this.is == __PLAYER_BLACK__ + __PIECE_SEPARATOR__ + __PIECE_PAWN__;
      }
      // ======================================================== <chess-piece>.isPiece
      isPiece(name) {
        return this.is.endsWith(name);
      }
      // ======================================================== <chess-piece>.isRook
      get isRook() {
        return this.isPiece(__PIECE_ROOK__);
      }
      // ======================================================== <chess-piece>.isKnight
      get isKnight() {
        return this.isPiece(__PIECE_KNIGHT__);
      }
      // ======================================================== <chess-piece>.isBishop
      get isBishop() {
        return this.isPiece(__PIECE_BISHOP__);
      }
      // ======================================================== <chess-piece>.isKing
      get isKing() {
        return this.isPiece(__PIECE_KING__);
      }
      // ======================================================== <chess-piece>.isQueen
      get isQueen() {
        return this.isPiece(__PIECE_QUEEN__);
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
          _moves = __HORSEMOVES__;
        } else if (this.isBishop) {
          _moves = __BISHOPMOVES__;
        } else if (this.isRook) {
          _moves = __ROOKMOVES__;
        } else if (this.isQueen) {
          _moves = __QUEENMOVES__;
        } else if (this.isKing) {
          _moves = __KINGMOVES__;
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
        // De array potentialMovesArray is alle mogelijkheden van possibleMove.
        let _potentialMovesArray = [];
        let _pieceMoves = this.pieceMoves;
        for (let line = 0; line < _pieceMoves.length; line++) {
          for (let move = 0; move < _pieceMoves[line].length; move++) {
            let [xAxis, yAxis] = _pieceMoves[line][move]; // get x,y movement 0,1
            let _squareName = this.possibleMove(xAxis, yAxis); // TODO:: this.possibleMove(pieceMoves[line][move]) // pass Array
            if (_squareName) {
              const _squareElement = this.chessboard.getSquare(_squareName); // get <chess-square> element
              //Eerst kijken of er een piece staat, en dan kijken of het dezelfde kleur heeft.
              if (_squareElement.piece) {
                if (this.isPawn /* We doen niks */) {
                  // do nothing for Pawns
                } else if (this.sameColorAsPiece(_squareElement.piece)) {
                  _squareElement.highlight(__PROTECT_PIECE__); // TODO:: move to .defendedBy() method
                  _squareElement.defendedBy(this);
                } else {
                  // not a pawn
                  // Als het een andere kleur heeft, __ATTACK_PIECE__, potentialMove!
                  // attackedby="Nb6,Qf3"
                  _squareElement.highlight(__ATTACK_PIECE__); // TODO:: move to .attackedBy() method
                  _squareElement.attackedBy(this);
                  _potentialMovesArray.push(_squareName);
                }
                // Deze break is er voor om niet stukken OVER een ander stuk nog te checken.
                // Als er geen piece op de squareElement staat. EMPTY.
                break;
              } else {
                _squareElement.highlight(__EMPTY_SQUARE__);
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
                _squareElement.highlight(__ATTACK_PIECE__); // TODO:: move to .attackedBy() method
                _squareElement.attackedBy(this);
                _potentialMovesArray.push(_squareName);
              } else {
                _squareElement.highlight(__PROTECT_PIECE__); // TODO:: move to .defendedBy() method
                _squareElement.defendedBy(this);
              }
            } else {
              // En passant
              if (this.chessboard.lastMove) {
                if (_squareName == this.chessboard.lastMove.enPassantPosition) {
                  _squareElement.highlight(__ATTACK_PIECE__); // TODO:: move to .attackedBy() method
                  _squareElement.attackedBy(this);
                  _potentialMovesArray.push(_squareName);
                }
              }
              _squareElement.defendedBy(this);
            }
          }
        };

        if (this.pieceName === __PIECE_WHITE_PAWN__) {
          pawnAttack(__PLAYER_BLACK__, -1, 1);
          pawnAttack(__PLAYER_BLACK__, 1, 1);
        } else if (this.pieceName === __PIECE_BLACK_PAWN__) {
          pawnAttack(__PLAYER_WHITE__, 1, -1);
          pawnAttack(__PLAYER_WHITE__, -1, -1);
        }

        // Roqueren
        if (this.isKing) {
          // TODO: ?? gaat dit wel goed als er andere stukken staan?
          const longWhiteTower = this.chessboard.getPiece(__SQUARE_BOTTOM_LEFT__);
          const shortWhiteTower = this.chessboard.getPiece(__SQUARE_BOTTOM_RIGHT__);
          const longBlackTower = this.chessboard.getPiece(__SQUARE_TOP_LEFT__);
          const shortBlackTower = this.chessboard.getPiece(__SQUARE_TOP_RIGHT__);

          const playerColor = this.chessboard.player;
          // TODO: onderstaande kan vervangen voor door 4x aanroepen van 1 function(fenLetter,destinationSquare,offset,squareName)
          if (playerColor == __PLAYER_WHITE__) {
            if (this.chessboard.castlingArray.includes(__FEN_WHITE_QUEEN__) && longWhiteTower.moves && longWhiteTower.moves.includes("d1")) {
              if (this.chessboard.castlingInterrupt(__PLAYER_WHITE__, -3)) {
                const squareName = "c1";
                this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
            if (this.chessboard.castlingArray.includes(__FEN_WHITE_KING__) && shortWhiteTower.moves && shortWhiteTower.moves.includes("f1")) {
              if (this.chessboard.castlingInterrupt(__PLAYER_WHITE__, 2)) {
                const squareName = "g1";
                this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
          } else if (playerColor == __PLAYER_BLACK__) {
            if (this.chessboard.castlingArray.includes(__FEN_BLACK_QUEEN__) && longBlackTower.moves && longBlackTower.moves.includes("d8")) {
              if (this.chessboard.castlingInterrupt(__PLAYER_BLACK__, -3)) {
                const squareName = "c8";
                this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
            if (this.chessboard.castlingArray.includes(__FEN_BLACK_KING__) && shortBlackTower.moves && shortBlackTower.moves.includes("f8")) {
              if (this.chessboard.castlingInterrupt(__PLAYER_BLACK__, 2)) {
                const squareName = "g8";
                this.square.squareElement(squareName).highlight(__EMPTY_SQUARE__);
                _potentialMovesArray.push(squareName);
              }
            }
          }
        }
        this.moves = _potentialMovesArray;
      } // potentialMoves
      // ======================================================== <chess-piece>.animateTo
      animateTo(destinationSquare) {
        let { top, left } = this.getBoundingClientRect();
        let { top: destTop, left: destLeft } = this.chessboard.getSquare(destinationSquare).getBoundingClientRect();
        this._savedposition = this.style.position;
        this.style.position = "absolute";
        return this.animate([{ transform: `translateX(0px) translateY(0px)` }, { transform: `translateX(${destLeft - left}px) translateY(${destTop - top}px)` }], {
          duration: __MOVEPIECE_ANIMATION_DURATION__,
          iterations: 1,
        }).finished; // finished promise later calls animateFinished, so we keep all animation logic within this class
      }
      // ======================================================== <chess-piece>.animateTo
      animateFinished() {
        this.style.position = this._savedposition;
      }
    }
  );

  /*************************************************************************
   <chess-square defendedby="Qf5" attackedby="nc5"> Web Component
   */
  customElements.define(
    __WC_CHESS_SQUARE__,
    class extends ChessBaseElement {
      // ======================================================== <chess-square>.observedAttributes
      static get observedAttributes() {
        return [__WC_ATTRIBUTE_PIECENAME__];
      }

      // ======================================================== <chess-square>.constructor
      constructor() {
        super();
        this.attackedArray = [];
        this.defendedArray = [];
      }
      // ======================================================== <chess-square>.handleFirstClick
      handleFirstClick() {
        if (this.hasAttribute(__WC_ATTRIBUTE_PIECENAME__)) {
          this.piece.potentialMoves(this.at);
          this.chessboard.pieceClicked = this.piece; // Hier wordt pieceClicked pas gedefinieerd.
          console.log("Mogelijke zetten: ", this.piece.pieceName, this.chessboard.pieceClicked.moves);
        }
      }
      // ======================================================== <chess-square>.handleSecondClick
      handleSecondClick() {
        const { chessboard, piece, at } = this;
        if (chessboard.pieceClicked) {
          if (/* piece on target or not, move piece */ chessboard.pieceClicked.moves.includes(at)) {
            chessboard.movePiece(chessboard.pieceClicked, at);
          } else {
            chessboard.initPlayerTurn();
          }
        } else {
          console.warn("handleSecondClick : No piece clicked");
        }
      }
      // ======================================================== <chess-square>.connectedCallback
      connectedCallback() {
        this.addEventListener("click", () => {
          if (this.chessboard.pieceClicked) {
            this.handleSecondClick();
          } else {
            this.handleFirstClick();
          }
        });
      }
      // ======================================================== <chess-square>.piece
      get piece() {
        return this.querySelector(__WC_CHESS_PIECE__) || false;
      }
      set piece(v) {
        // TODO: proces as string or element
        // on string createElement
      }
      // ======================================================== <chess-square>.squareElement
      squareElement(squareName) {
        return this.chessboard.getSquare(squareName);
      }
      // ======================================================== <chess-square>.addPiece
      addPiece(piece = console.error("No piece defined!")) {
        piece = piece || __FEN_WHITE_KING__; // default value for undefined piece
        let name;
        if (isString(piece)) {
          name = piece.length == 1 ? convertFEN(piece) : piece;
          piece = document.createElement(__WC_CHESS_PIECE__); // create <chess-piece is="wit-koning" at="d5">
          piece.is = name;
        } else {
          name = piece.is;
        }
        this.clear();
        this.pieceName = name;
        return this.appendChild(piece);
      }
      // ======================================================== <chess-square>.attackedBy
      attackedBy(chessPiece) {
        this.attackedArray.push(convertFEN(chessPiece.is) + chessPiece.at);
        this.setAttribute("attackedby", this.attackedArray.join(","));
      }
      // ======================================================== <chess-square>.attackedBy
      defendedBy(chessPiece) {
        this.defendedArray.push(convertFEN(chessPiece.is) + chessPiece.at);
        this.setAttribute("defendedby", this.defendedArray.join(","));
      }
      // ======================================================== <chess-square>.translate
      translate(x_move, y_move) {
        // TODO: This is the same code as possibleMove in <chess-piece
        //
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
        this.removeAttribute(__WC_ATTRIBUTE_PIECENAME__);
        this.style.border = "";
        this.innerHTML = "";
        this.clearAttributes();
      }
      // ======================================================== <chess-square>.clearAttributes
      clearAttributes() {
        this.removeAttribute("attackedby");
        this.removeAttribute("defendedby");
        this.attackedArray = [];
        this.defendedArray = [];
      }
      // ======================================================== <chess-square>.pieceName
      get pieceName() {
        return this.getAttribute(__WC_ATTRIBUTE_PIECENAME__) || "";
      }
      set pieceName(pieceName) {
        this.setAttribute(__WC_ATTRIBUTE_PIECENAME__, pieceName);
        return pieceName;
      }
      // ======================================================== <chess-square>.capturePieceBy
      capturePieceBy(chessPiece = { is: "NO PIECE" }) {
        const { chessboard, piece } = this;
        const pieceName = piece.is;
        if (piece) {
          if (piece.isWhite) {
            chessboard.capturedWhitePieces.push(pieceName);
            console.log("Captured White Pieces:", chessboard.capturedWhitePieces);
          } else {
            chessboard.capturedBlackPieces.push(pieceName);
            console.log("Captured Black Pieces:", chessboard.capturedBlackPieces);
          }
          this.clear();
          this.append(chessPiece); // put piece in new location
          return pieceName;
        } else return false;
      }
      // ======================================================== <chess-square>.isDefendedBy
      isDefendedBy(color) {
        // TODO: write documentation, maybe write better code
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
        return color !== defendedColor;
      } // <chess-square>.isAttackedBy
    } // <chess-square>
  ); //defineElement(__WC_CHESS_SQUARE__)

  /*************************************************************************
   <chess-board fen="" player="wit"> Web Component
   */
  customElements.define(
    __WC_CHESS_BOARD__,
    class extends ChessBaseElement {
      // ======================================================== <chess-board>.observedAttributes
      static get observedAttributes() {
        return [__WC_ATTRIBUTE_FEN__];
      }
      // ======================================================== <chess-board>.constructor
      constructor() {
        super();
        // TODO: Looks like a bug, every piece moved ends up in this array
        this.capturedBlackPieces = [];
        this.capturedWhitePieces = [];
        this.moves = [];
      }
      // ======================================================== <chess-board>.connectedCallback
      connectedCallback() {
        // when this Component is added to the DOM, create the board with FEN and Arrays.
        this.createboard(this.getAttribute("template")); // id="Rob2"
        if (this.hasAttribute(__WC_ATTRIBUTE_FEN__)) this.fen = this.getAttribute(__WC_ATTRIBUTE_FEN__);
        this.calculateBoard();
        this.initPlayerTurn();
      }
      // ======================================================== <chess-board>.attributeChangedCallback
      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue && name == __WC_ATTRIBUTE_FEN__) {
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
          this.innerHTML = chessboard_innerHTML;
        }

        // instead of 'const' store the variables on the <chess-board> so ALL code can use it (in 2022)
        this.files = __FILES__; // ["a", "b", "c", "d", "e", "f", "g", "h"]; // Kolommen
        this.ranks = __RANKS__.reverse(); // ["8", "7", "6", "5", "4", "3", "2", "1"]; // Rijen
        this.squares = [];

        let gridareasHTML = "";
        let chess_squaresHTML = "";
        let fieldColor = true; // alternate white/black colors, a8 is white

        for (var rank = 0; rank < this.ranks.length; rank++) {
          for (var file = 0; file < this.files.length; file++) {
            const square = this.files[file] + this.ranks[rank]; // "a8"
            this.squares.push(square);

            gridareasHTML += `[${__WC_ATTRIBUTE_AT__}="${square}"] { grid-area: ${square} }`;

            let fieldClass = fieldColor ? __CLASSNAME_WHITESQUARE__ : __CLASSNAME_BLACKSQUARE__;
            chess_squaresHTML += `<${__WC_CHESS_SQUARE__} class="${fieldClass}" ${__WC_ATTRIBUTE_AT__}="${square}"></${__WC_CHESS_SQUARE__}>`;
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
      // ======================================================== <chess-board>.getSquare
      getSquare(square) {
        // square can be "c5" OR a reference to <chess-square at="c5">
        // return reference to <chess-square at=" [position] ">
        if (isString(square)) return this.queryBoard(`[${__WC_ATTRIBUTE_AT__}="${square}"]`);
        else return square;
      }
      // ======================================================== <chess-board>.hasSquare
      hasSquare(square) {
        return this.squares.includes(square);
      }
      // ======================================================== <chess-board>.getPiece
      getPiece(square) {
        return this.getSquare(square).piece;
      }
      // ======================================================== <chess-board>.addPiece
      addPiece(name, at) {
        //if piecename is one FEN letter
        if (name.length == 1) name = convertFEN(name);
        return this.getSquare(at).addPiece(name);
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
        // clearMoves
        for (let element of this.squares) {
          let chessSquare = this.getSquare(element);
          chessSquare.highlight(false);
        }
      }
      // ======================================================== <chess-board>.changePlayer
      changePlayer(piece = this.pieceClicked) {
        this.calculateBoard();
        this.checkMate();
        this.player = otherPlayer(this.player); // TODO: Naar FEN
        this.initPlayerTurn();
      }
      // ======================================================== <chess-board>.recordMove
      recordMove(chessPiece, fromSquare, toSquare) {
        // TODO: FIX Logic Bug recordMove is execute AFTER piece was add to toSquare
        let moveType = toSquare.capturePieceBy(chessPiece) ? __MOVETYPE_CAPTURE__ : __MOVETYPE_MOVE__;
        console.warn("recordMove:", chessPiece.is, fromSquare.at, moveType, toSquare.at);
        this.moves.push({
          chessPiece,
          fromSquare,
          toSquare,
        });
        // emit Event to <chess-match> which records all moves in database
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
          this.recordMove(chessPiece, fromSquare, toSquare);

          //!let testsquare = this.chessboard.getSquare("e3");
          //! (tech!) chessPiece DOM verplaatsen, daarna fromSquare leeg maken
          //! het werkt wel andersom; maar eens verder testen
          toSquare.addPiece(chessPiece);
          fromSquare.clear();
          //!console.error("state", testsquare.piece, chessPiece);

          this.lastMove.enPassantPosition = this.enPassantPosition(this.lastMove); // Was er een en passant square van een pion?
          chessPiece.animateFinished();

          this.reduceCastlingArray(chessPiece.at);
          let doneCastlingMove = false;
          if (chessPiece.isKing) {
            doneCastlingMove = this.castlingMove(chessPiece, fromSquare, toSquare);
          }
          console.error("moved ", chessPiece.at, chessPiece.is, "player:", this.player, chessPiece.isPawnAtEnd);

          // TODO: Recrreate promotion
          if (chessPiece.isPawnAtEnd) {
            // TODO: move to <chess-piece>.promotion() method
            this.collectPiece().then((chosenPiece) => {
              console.log("chosenPiece:", chosenPiece, this);
              this.addPiece(chosenPiece, toSquare.at);
              document.getElementById("message").innerText = "";
            });
          }
          if (!doneCastlingMove) this.changePlayer();

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
        const { chessPiece, fromSquare, toSquare } = lastMove;
        if (chessPiece.isPawn && Math.abs(toSquare.rank - fromSquare.rank) == 2) {
          console.log(lastMove.chessPiece);
          // TODO: waarom Math.abs nodig?
          // let position = "";
          // if (piece.isWhite) position = fromSquare.file + "3";
          // else position = fromSquare.file + "6";
          // TODO: learn above 3 lines is same as:
          let position = fromSquare.file + (chessPiece.isWhite ? "3" : "6"); // file+3 OF file+6

          console.log("En passant positie", position);
          // addPositionToFEN();
          return position;
        }
      }
      // ======================================================== <chess-board>.lastMove
      get lastMove() {
        if (this.moves && this.moves.length) {
          return this.moves.slice(-1)[0];
        }
      }
      // ======================================================== <chess-board>.castlingInterrupt
      // False: Castling impossible
      castlingInterrupt(color, offset) {
        // let kingPosition = "";
        // if (color == __PLAYER_WHITE__) {
        //   kingPosition = this.getSquare("e1");
        // } else {
        //   kingPosition = this.getSquare("e8");
        // }
        // TODO: learn above lines is same as:
        let kingPosition = this.getSquare(color == __PLAYER_WHITE__ ? __SQUARE_WHITE_KING_START__ : __SQUARE_BLACK_KING_START__);

        if (offset < 0) {
          for (let i = -1; i >= offset; i--) {
            // TODO: volgende 5 regels zijn hetzelfde als in de 2e for loop, maak er een functie van
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
      reduceCastlingArray(lastReduceMove) {
        // TODO: refactor to one single .filter method using at location as first and a function as second parameter
        if (lastReduceMove == __SQUARE_BOTTOM_LEFT__) {
          this.castlingArray = this.castlingArray.filter((item) => item !== __FEN_WHITE_QUEEN__);
        } else if (lastReduceMove == __SQUARE_BOTTOM_RIGHT__) {
          this.castlingArray = this.castlingArray.filter((item) => item !== __FEN_WHITE_KING__);
        } else if (lastReduceMove == __SQUARE_TOP_LEFT__) {
          this.castlingArray = this.castlingArray.filter((item) => item !== __FEN_BLACK_QUEEN__);
        } else if (lastReduceMove == __SQUARE_TOP_RIGHT__) {
          this.castlingArray = this.castlingArray.filter((item) => item !== __FEN_BLACK_KING__);
        } else if (lastReduceMove == __SQUARE_WHITE_KING_START__) {
          this.castlingArray = this.castlingArray.filter((item) => item !== __FEN_WHITE_QUEEN__ && item !== __FEN_WHITE_KING__);
        } else if (lastReduceMove == __SQUARE_BLACK_KING_START__) {
          this.castlingArray = this.castlingArray.filter((item) => item !== __FEN_BLACK_QUEEN__ && item !== __FEN_BLACK_KING__);
        }
      }
      // ======================================================== <chess-board>.castlingMove
      castlingMove(chessPiece, fromSquare, toSquare) {
        const moveSecondPiece = (from, to) => {
          this.movePiece(this.getPiece(this.getSquare(from)), to);
          return true;
        };
        if (fromSquare.at == __SQUARE_WHITE_KING_START__) {
          if (toSquare.at == "c1") {
            return moveSecondPiece("a1", "d1");
          } else if (toSquare.at == "g1") {
            return moveSecondPiece("h1", "f1");
          }
        } else if (fromSquare.at == __SQUARE_BLACK_KING_START__) {
          if (toSquare.at == "c8") {
            return moveSecondPiece("a8", "d8");
          } else if (toSquare.at == "g8") {
            return moveSecondPiece("h8", "f8");
          }
        }
        return false; // no castling move
      }

      // ======================================================== <chess-board>.collectPiece
      collectPiece() {
        // TODO: move to <chess-piece>.promotion method
        document.getElementById("message").innerText = "Kies een stuk (toets letter in): Q, N, R, B.";
        const thisPawn = this.lastMove.chessPiece;
        const color = thisPawn.color;
        const eventName = "keydown";
        return new Promise((resolve) => {
          // TODO: verify with Sandro, Bart, Danny why a Promise is used
          const choosePiece = (evt) => {
            let chosenPiece = "";
            window.removeEventListener(eventName, choosePiece);
            // TODO: learn getting one value from an {} Object
            // let chosenPiece =
            //   color +
            //   __PIECE_SEPARATOR__ +
            //   {
            //     q: __PIECE_QUEEN__,
            //     n: __PIECE_KNIGHT__,
            //     r: __PIECE_ROOK__,
            //     b: __PIECE_BISHOP__,
            //   }[evt.key];
            switch (evt.key) {
              case "q":
                chosenPiece = color + __PIECE_SEPARATOR__ + __PIECE_QUEEN__;
                break;
              case "n":
                chosenPiece = color + __PIECE_SEPARATOR__ + __PIECE_KNIGHT__;
                break;
              case "r":
                chosenPiece = color + __PIECE_SEPARATOR__ + __PIECE_ROOK__;
                break;
              case "b":
                chosenPiece = color + __PIECE_SEPARATOR__ + __PIECE_BISHOP__;
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
      findPieceSquare(piece) {
        if (isString(piece)) {
          return this.querySelector(`${__WC_CHESS_SQUARE__}[${__WC_ATTRIBUTE_PIECENAME__}="${piece}"]`);
        } else {
          return piece.square; // <chess-piece>.square getter
        }

        // TODO: learn from Old code:
        // for (const square of this.squares) {
        //   const specificPiece = this.getSquare(square).piece;
        //   if (specificPiece && specificPiece.is == piece) {
        //     return this.getSquare(square);
        //   }
        // }
      }
      // ======================================================== <chess-board>.isInCheck
      isInCheck() {
        // TODO: refactor to <chess-piece>.isAttacked GETTER
        // get attackedBy(){
        //   return this.square.getAttribute("attackedBy").split(",") || []; // new: use Arrays not Strings
        // then :
        // <chess-board>.isInCheck
        // get isIncheck(){
        //   const kingSquare = (color) => this.findPieceSquare(king(color));
        //   return kingSquare(__PLAYER_WHITE__).attackedBy || kingSquare(__PLAYER_BLACK__).attackedBy;
        // }
        const king = (color) => color + __PIECE_SEPARATOR__ + __PIECE_KING__;
        const kingSquare = (color) => this.findPieceSquare(king(color));
        const kingAttackers = (color) => kingSquare(color).getAttribute("attackedBy") || "";
        const isKingAttacked = (color) => kingAttackers(color).length;
        if (isKingAttacked(__PLAYER_WHITE__)) {
          console.log("Witte koning staat schaak door", kingAttackers(__PLAYER_WHITE__));
          const whiteInCheck = true;
        }
        if (isKingAttacked(__PLAYER_BLACK__)) {
          console.log("Zwarte koning staat schaak door", kingAttackers(__PLAYER_BLACK__));
          const blackInCheck = true;
        }
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
      // ======================================================== <chess-board>.findSquaresBetween
      findSquaresBetween(attackingPieceSquare, kingSquare) {
        const files = this.files;
        const getNum = (value) => {
          for (let i = 0; i < files.length; i++) {
            if (files[i] == value) return i;
          }
        };
        const x = getNum(kingSquare.file) - getNum(attackingPieceSquare.file); // Negatief of positief
        const y = kingSquare.rank - attackingPieceSquare.rank; // Negatief of positief
        const squaresBetweenArray = [];
        if (x == 0) {
          // verticaal
          if (y > 0) {
            for (let i = 1; i < y; i++) {
              const betweenSquare = attackingPieceSquare.translate(0, i);
              squaresBetweenArray.push(betweenSquare);
            }
          } else {
            for (let i = -1; i > y; i--) {
              const betweenSquare = attackingPieceSquare.translate(0, i);
              squaresBetweenArray.push(betweenSquare);
            }
          }
        } else if (y == 0) {
          // horizontaal
          if (x > 0) {
            for (let i = 1; i < x; i++) {
              const betweenSquare = attackingPieceSquare.translate(i, 0);
              squaresBetweenArray.push(betweenSquare);
            }
          } else {
            for (let i = -1; i > x; i--) {
              const betweenSquare = attackingPieceSquare.translate(i, 0);
              squaresBetweenArray.push(betweenSquare);
            }
          }
        } else if (Math.abs(x) == Math.abs(y)) {
          // diagonaal
          if (x > 0 && y > 0) {
            for (let i = 1; i < x; i++) {
              const betweenSquare = attackingPieceSquare.translate(i, i);
              squaresBetweenArray.push(betweenSquare);
            }
          } else if (x > 0 && y < 0) {
            for (let i = 1; i < x; i++) {
              const betweenSquare = attackingPieceSquare.translate(i, -i);
              squaresBetweenArray.push(betweenSquare);
            }
          } else if (x < 0 && y < 0) {
            for (let i = -1; i > x; i--) {
              const betweenSquare = attackingPieceSquare.translate(i, i);
              squaresBetweenArray.push(betweenSquare);
            }
          } else if (x < 0 && y > 0) {
            for (let i = -1; i > x; i--) {
              const betweenSquare = attackingPieceSquare.translate(i, -i);
              squaresBetweenArray.push(betweenSquare);
            }
          }
        }
        console.log("Squares between:", squaresBetweenArray);
        this.squaresBetween = squaresBetweenArray;
      }
      // ======================================================== <chess-board>.negatingCheck
      negatingCheck() {
        console.log("negatingCheck");
        // Capture Attacking Piece --- Works only for one attacking piece. Which is not enough. Change later!
        const checkPieceSquare = this.findSinglePiece("wit-koning").getAttribute("attackedby"); // qe2 (of meerdere stukken)
        if (checkPieceSquare) {
          const attackingPiece = this.getPiece(checkPieceSquare.substring(1, 3));
          if (this.getSquare(checkPieceSquare.substring(1, 3)).getAttribute("attackedby")) {
            console.log("You can take the checking (black) piece");
            return true;
          } else if (attackingPiece) {
            // Intervening Chess ---
            // 1. What is the attacking piece? Q.
            // 2. Is there 1 or more squares in between attacking piece and king?
            const attackingPieceSquare = this.getSquare(checkPieceSquare.substring(1, 3));
            // 3. Is it a horse? No.
            const kingSquare = this.findSinglePiece("wit-koning");
            if (attackingPiece !== "zwart-paard") {
              if (attackingPieceSquare.file - kingSquare.file >= 2 || attackingPieceSquare.rank - kingSquare.rank >= 2) {
                const squaresBetween = true;
              }
            }
            // 4. Q => if (same file/ rank) Rook behaviour.
            if (attackingPiece == "zwart-koningin" && (attackingPieceSquare.file == kingSquare.file || attackingPieceSquare.rank == kingSquare.rank)) {
              // pieceMoves = __ROOKMOVES__;
            } else {
              // pieceMoves = __BISHOPMOVES__;
            }
            // 5. findSquaresBetween horizontally, vertically or diagonally.
            this.findSquaresBetween(attackingPieceSquare, kingSquare);
            // 6. defendedby lower or upper.
            this.squaresBetween.forEach((element) => {
              if (this.getAttribute("player") == "wit" && this.getSquare(element).isDefendedBy("wit") == true) {
                console.log("Je kan er tussen");
                return true;
              } else if (this.getAttribute("player") == "zwart" && this.getSquare(element).isDefendedBy("zwart") == true) {
                console.log("Je kan er tussen");
                return true;
              }
            });
          } else if (attackingPiece) {
            // Kingmoves --- Can king move out of chess.
          }
        }
        return false;
      }
      // ======================================================== <chess-board>.checkMate
      checkMate() {
        if (this.isInCheck() && !this.negatingCheck()) {
          console.log("Checkmate", this.player);
        }
      }
      // ======================================================== <chess-board>.staleMate
      staleMate() {
        if (!whiteInCheck && king(color).potentialMoves == []) {
          console.log("Stalemate!");
        }
      }

      // ======================================================== <chess-board>.documentation
      documentation() {
        // documentatie van class Methods en Properties in console.log
        this.docs(this);
        this.docs(this.querySelector(__WC_CHESS_SQUARE__));
        this.docs(this.querySelector(__WC_CHESS_PIECE__));
      }
      // ======================================================== <chess-board>.fen SETTER/GETTER
      set fen(fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {
        // TODO: Waarom hier??
        this.castlingArray = [__FEN_WHITE_KING__, __FEN_WHITE_QUEEN__, __FEN_BLACK_KING__, __FEN_BLACK_QUEEN__]; // Halen we uit FEN

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
              const fenPiece = convertFEN(piece.is);
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
        return this.hasAttribute(__WC_ATTRIBUTE_RECORD__);
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
        return this.getAttribute(__WC_ATTRIBUTE_PLAYER__);
      }
      set player(v) {
        return this.setAttribute(__WC_ATTRIBUTE_PLAYER__, v);
      }
      // ======================================================== <chess-board>.save
      save(){
        localStorage.setItem("fen", this.fen);
        document.getElementById("fen").value = this.fen;
      }
    } // class ChessBoard
  ); // end of class definition
  // end IIFE
})();
