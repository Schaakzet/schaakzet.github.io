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
          if (match_id) {
            this.resumeMatch(match_id);
          } else this.createMatch(); // call back-end for match_id, then this.initGame(match_id)
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
          method: "POST",
          body: data,
        })
          .then((response) => response.json())
          .then((match_id) => {
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
            log("Update Match success: ", match_id);
          });
      }
      // ================================================== resumeMatch
      // Gets match_id, FEN, players and their name & color
      resumeMatch(match_id = localStorage.getItem("match_id")) {
        this.chessboard.restart();
        this.chessboard.id = match_id;

        let data = new FormData();
        data.append("id", match_id);
        data.append("function", "fetch");

        console.error("resumeMatch MATCH ID", match_id);

        fetch(CHESS.__API_MATCHES__, {
          method: "POST",
          body: data,
        })
          .then((response) => response.json())
          .then((obj) => {
            console.log("resumeMatch with FEN:", obj.fen);
            // let temp = str.split(",");
            // let fen = temp[2].replace("fen :", "").trim().replaceAll("\\", "");
            this.chessboard.fen = obj.fen;
            // this.player_white = player_white;
            // this.player_black = player_black;
            // this.player_white_color = player_white_color;
            // this.player_black_color = player_black_color;
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
        log("storeMove", move, chessboard.id);
        chessboard.saveFENinLocalStorage();
        chessboard.updateFENonScreen();
        // ------------------------------------------------- FormData
        let body = new FormData();
        body.append("function", "insert");
        body.append("id", chessboard.id);
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
        log(match_id);
        this.match_id = match_id;
        this.chessboard.id = match_id;
        this.chessboard.fen = undefined; // set start FEN
        localStorage.setItem("match_id", this.match_id);
        // this.testGame();
      }
      // ================================================== myFEN
      myFEN() {
        this.chessboard.fen = "r3kbnr/ppp2ppp/2npbq2/4p3/4P3/2NPBQ2/PPP2PPP/R3KBNR w KQkq -";
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
