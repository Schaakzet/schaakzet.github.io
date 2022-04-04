!(function () {
  // <chess-match> encapsulates <chess-board>
  // manages players
  // communicates with server
  function log(...args) {
    console.log("%c chess-match ", "background:green;color:yellow", ...args);
  }
  // ********************************************************** define <chess-match>
  customElements.define(
    "chess-match",
    class extends CHESS.ChessBaseElement {
      // todo create shadowDOM?
      connectedCallback() {
        this.render();
        setTimeout(() => {
          this.createMatch(); // call back-end for match_id, then this.initGame(match_id)
        });
      }
      // ================================================== get chessboard
      get chessboard() {
        // todo find chessboard inside shadowDOM?
        if (this._chessboard) return this._chessboard;
        return (this._chessboard = document.querySelector("chess-board") || console.error("Missing chess-board"));
      }
      // ================================================== render
      render() {
        // todo render the HTML from match.html
      }
      // ================================================== initGame
      initGame(match_id) {
        log("initGame match_id:", match_id);
        console.todo("verify FEN is correct in Database, localStorage");
        this.match_id = match_id;
        this.addListeners();
        this.chessboard.fen = undefined; // set start FEN
        this.chessboard.play([["e2", "e4"], ["e7", "e5"], ["g1", "f3"], ["b8", "c6"]]);
      }
      // ================================================== getPlayerName
      getPlayerName(idx = 0) {
        // handle: 0,1,white,black
        if (idx == "white") idx = 0;
        if (idx == "black") idx = 1;
        if (idx) return "BLACK";
        else return "WHITE";
      }
      // ================================================== storeMove
      addListeners() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.storeMove(evt.detail));

        // handle game buttons
        this.addEventListener(this.localName, (e) => {
          if (this[e.detail.value]) this[e.detail.value](e);
        });
        this.addListeners = () => {}; // attach listeners only once
      }
      // ================================================== createMatch
      createMatch() {
        CHESS.CRUDAPI = document.location.hostname.includes("127");
        if (CHESS.CRUDAPI) {
          // ------------------------------------------------- CHESS.API.matches.create
          CHESS.API.matches.create({
            callback: (match_id) => this.initGame(match_id),
          });
        } else {
          // ------------------------------------------------- RT API
          const body = new FormData();
          body.append("function", "insert");
          body.append("table", "matches");
          body.append("data[player_White]", "klaas");
          body.append("data[player_Black]", "jantje");

          fetch(CHESS.__API_MATCHES__, {
            method: "POST",
            headers: CHESS.__API_HEADERS__,
            body,
          })
            .then((response) => response.json())
            .then((result) => {
              log("RT API success: ", result);
              this.initGame(match_id);
            });
        }
      } //createMatch
      // ================================================== storeMove
      storeMove({
        chessboard = this.chessboard, //
        move = "e2-e4",
        fromsquare = "e2",
        tosquare = "e4",
        fen = chessboard.fen,
      }) {
        log("storeMove", move);
        chessboard.saveFENinLocalStorage();
        chessboard.updateFENonScreen();

        // ------------------------------------------------- store move in matches
        CHESS.API.matches.update({
          player_white: this.getPlayerName(0),
          player_black: this.getPlayerName(1),
          match_id: this.match_id,
          fen,
        });
        // ------------------------------------------------- store move in matchmoves
        fetch(CHESS.__API_RECORDS__ + CHESS.__API_TABLE_MATCHMOVES__, {
          method: "POST",
          headers: CHESS.__API_HEADERS__,
          body: JSON.stringify({
            name: chessboard.database_id,
            move,
            fromsquare,
            tosquare,
            fen,
          }),
        });
        // ------------------------------------------------- store move in matchmoves
        this.checkDatabase();
      }
      // ================================================== checkDatabase
      checkDatabase(){
        CHESS.API.matches.read({
          match_id: this.match_id,
          callback: (match) => {
            log("checkDatabase FEN:", match.fen);
          }
        })
      }
      // ================================================== restartGame
      restartGame() {
        log("RESTART GAME"); //todo
      }
      // ================================================== undoMove
      undoMove() {
        log("UNDO MOVE"); //todo
        this.chessboard.undoMove();
      }
      // ==================================================
    } //class
  ); //customElements.define("chess-match", class extends CHESS.ChessBaseElement
  // ********************************************************** end IIFE
})();
