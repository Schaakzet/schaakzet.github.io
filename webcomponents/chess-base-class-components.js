// ********************************************************** Chess BaseElement for <chess-board>,<chess-square>,<chess-piece>
CHESS.ChessBaseSquarePieceElement = class extends CHESS.ChessBaseElement {
    constructor(){
        super();
    }
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
      if (this.localName == CHESS.__WC_CHESS_PIECE__) {
        return this.square.getAttribute(CHESS.__WC_ATTRIBUTE_AT__);
      } else {
        return this.getAttribute(CHESS.__WC_ATTRIBUTE_AT__);
      }
    }
    set at(at) {
      if (this.localName == CHESS.__WC_CHESS_PIECE__) {
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
      return this.closest(CHESS.__WC_CHESS_BOARD__);
    }
    // ======================================================== <chess-*>.square
    get square() {
      return this.closest(CHESS.__WC_CHESS_SQUARE__);
    }
  };
  