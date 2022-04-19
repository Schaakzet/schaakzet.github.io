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
          let match_id = localStorage.getItem("match_id");
          if (match_id) this.restartGame(match_id);
          else this.createMatch(); // call back-end for match_id, then this.initGame(match_id)
          this.addListeners();
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
      // ================================================== getPlayerName
      getPlayerName(idx = 0) {
        // handle: 0,1,white,black
        if (idx == "white") idx = 0;
        if (idx == "black") idx = 1;
        if (idx) return "player_black";
        else return "Laurent";
      }
      // ================================================== addListeners
      addListeners() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.storeMove(evt.detail));
        // handle game buttons
        document.addEventListener(this.localName, (e) => {
          if (this[e.detail.value]) this[e.detail.value](e);
        });
        this.addListeners = () => {}; // attach listeners only once
      }
      // ================================================== createMatch
      createMatch() {
        CHESS.CRUDAPI = true; // document.location.hostname.includes("127");
        if (CHESS.CRUDAPI) {
          // ------------------------------------------------- CHESS.API.matches.create
          CHESS.API.matches.create({
            callback: (match_id) => this.initGame(match_id),
          });
        } else {
          // ------------------------------------------------- RT API
          let data = new FormData();
          data.append("function", "insert");
          data.append("table", "matches");
          data.append("data[player_white]", this.getPlayerName(0));
          data.append("data[player_black]", this.getPlayerName(1));

          // body = JSON.stringify({
          //   function: "insert",
          //   player_white: "WIT",
          //   player_black: "ZWART",
          // });
console.error(666);
          fetch(CHESS.__API_MATCHES__, {
            method: "POST",
            body: data,
          })
            .then((response) => response.text())
            .then((match_id) => {
              log("RT API success: ", match_id);
              this.initGame(match_id);
            });
        }
      } //createMatch
      // ================================================== update matches
      updateMatch(match_id) {
        const chessboard = this.chessboard;
        const fen = chessboard.fen;
        CHESS.API.matches.update({
          player_white: this.getPlayerName(0),
          player_black: this.getPlayerName(1),
          match_id,
          fen,
        });
      }
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
        this.updateMatch(this.match_id);
        // ------------------------------------------------- store move in matchmoves
        fetch(CHESS.__API_RECORDS__ + CHESS.__API_TABLE_MATCHMOVES__, {
          method: "POST",
          headers: CHESS.__API_HEADERS__,
          body: JSON.stringify({
            match_id: this.match_id,
            move,
            fromsquare,
            tosquare,
            fen,
          }),
        });
        // ------------------------------------------------- store move in matchmoves
        this.checkDatabase(this.match_id);
      }
      // ================================================== checkDatabase
      checkDatabase(match_id) {
        this.match_id = match_id;
        localStorage.setItem("match_id", this.match_id);
        CHESS.API.matches.read({
          match_id: this.match_id,
          callback: (match) => {
            log("checkDatabase FEN:", { match });
            // todo set match values
            // set chessboard.fen
            // set playernames
          },
        });
      }
      // ================================================== initGame
      initGame(match_id) {
        log("initGame match_id:", match_id);
        console.todo("verify FEN is correct in Database, localStorage");
        this.match_id = match_id;
        this.chessboard.fen = undefined; // set start FEN
        // this.testGame();
      }
      // ================================================== testGame
      testGame() {
        this.chessboard.play([
          ["e2", "e4"],
          ["e7", "e5"],
          ["g1", "f3"],
          ["b8", "c6"],
        ]);
      }
      // ================================================== restartGame
      restartGame(match_id) {
        log("RESTART GAME", match_id); //todo test
        localStorage.removeItem("match_id");
        this.chessboard.restart();
        this.checkDatabase(match_id);
      }
      // ================================================== undoMove
      undoMove() {
        log("UNDO MOVE"); //todo test
        this.chessboard.undoMove();
      }
      // ================================================== remise
      remise() {
        if (confirm("Remise?")) {
          this.chessboard.setMessage("Game over. Gelijkspel.");
          this.chessboard.classList.add("game_over");
        }
      }
    } //class
  ); //customElements.define("chess-match", class extends CHESS.ChessBaseElement
  // ********************************************************** end IIFE
})();
