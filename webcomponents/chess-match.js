!(function () {
  // <chess-match> encapsulates <chess-board>
  // manages players
  // communicates with server
  function log(...args) {
    console.log("%c chess-match ", "background:green;color:yellow", ...args);
  }

  // ********************************************************** CSS for Full Screen
  const CSS_Match = /* css */ `:fullscreen {background-color: beige}`;
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
        const style = Object.assign(document.createElement("style"), {
          innerHTML: CSS_Match,
        });

        this.append(style);
      }
      // ================================================== addListeners
      addListeners() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.storeMove(evt.detail));
        // handle game buttons
        document.addEventListener(this.localName, (e) => {
          if (this[e.detail.value]) this[e.detail.value](e);
        });
        document.addEventListener("inputValue", (evt) => this.updateMatch());
        this.addListeners = () => {}; // attach listeners only once
      }

      // ================================================== createMatch
      createMatch() {
        // ------------------------------------------------- RT API
        let data = new FormData();
        data.append("function", "insert");
        data.append("table", "matches");
        data.append("data[player_white]", "Init Player 1");
        data.append("data[player_black]", "Init Player 2");

        fetch(CHESS.__API_MATCHES__, {
          // Old. Naar Bart. https://schaakzet.nl/api/rt/matches.php
          method: "POST",
          body: data,
        })
          .then((response) => response.text())
          .then((match_id) => {
            log("RT API success: ", match_id);
            this.initGame(match_id);
          });
      } //createMatch
      // ================================================== update matches
      updateMatch() {
        const match_id = localStorage.getItem("match_id");
        console.log("MATCH ID", match_id);
        let data = new FormData();
        data.append("function", "update");
        data.append("id", match_id);
        data.append("data[player_white]", document.querySelector("chess-player-white").querySelector("span").innerHTML);
        data.append("data[player_black]", document.querySelector("chess-player-black").querySelector("span").innerHTML);

        fetch(CHESS.__API_MATCHES__, {
          method: "POST",
          body: data,
        })
          .then((response) => response.text())
          .then((match_id) => {
            log("RT API success: ", match_id);
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
        // ------------------------------------------------- FormData
        let body = new FormData();
        body.append("function", "insert");
        body.append("id", this.match_id);
        body.append("data[move]", move);
        body.append("data[fromsquare]", fromsquare);
        body.append("data[tosquare]", tosquare);
        body.append("data[fen]", fen);
        // ------------------------------------------------- store move in matchmoves
        fetch("https://schaakzet.nl/api/rt/matchmoves.php", {
          method: "POST",
          body,
        })
          .then((response) => response.json())
          .then((res) => {
            console.log(res);
          });
        // ------------------------------------------------- store move in matchmoves
        // this.checkDatabase(this.match_id);
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
      // ================================================== testGame
      testGame() {
        this.chessboard.play([
          ["e2", "e4"],
          ["e7", "e5"],
          ["g1", "f3"],
          ["b8", "c6"],
        ]);
      }
      // ================================================== initGame
      initGame(match_id) {
        log("initGame match_id:", match_id);
        console.todo("verify FEN is correct in Database, localStorage");
        this.match_id = match_id;
        this.chessboard.fen = undefined; // set start FEN
        localStorage.setItem("match_id", this.match_id);

        // this.testGame();
      }
      // ================================================== restartGame
      restartGame() {
        log("RESTART GAME"); //todo test
        // localStorage.removeItem("match_id");
        this.chessboard.restart();
        this.createMatch();
      }
      // ================================================== undoMoveDB
      undoMoveDB() {
        // ------------------------------------------------- FormData
        let body = new FormData();
        body.append("function", "delete"); // API decides it is last record of match_id.
        body.append("id", this.match_id);
        // ------------------------------------------------- store move in matchmoves
        fetch("https://schaakzet.nl/api/rt/matchmoves.php", {
          method: "POST",
          body,
        })
          .then((response) => response.json())
          .then((res) => {
            console.log(res);
          });
      }
      // ================================================== undoMove
      undoMove() {
        log("UNDO MOVE"); //todo test
        this.chessboard.undoMove();
        this.undoMoveDB();
        this.dispatch({
          root: document,
          name: "undoMove",
          detail: {
            chessboard: this.chessboard,
            toSquare: this.chessboard.lastMove.toSquare,
          },
        });
      }
      // ================================================== remise
      remise() {
        if (confirm("Remise?")) {
          this.chessboard.setMessage("Game over. Gelijkspel.");
          this.chessboard.classList.add("game_over");
        }
      }
      // ================================================== remise
      fullScreen() {
        var elem = this;

        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          /* Safari */
          elem.webkitRequestFullscreen();
        }
      }
    } //class
  ); //customElements.define("chess-match", class extends CHESS.ChessBaseElement
  // ********************************************************** end IIFE
})();
