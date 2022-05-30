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
        this.append(
          Object.assign(document.createElement("style"), {
            innerHTML: CSS_Match,
          }),
          Object.assign(document.createElement("div"), {
            innerHTML:
              `<h2>Match <chess-players></chess-players></h2>` +
              `<chess-match-buttons></chess-match-buttons>` +
              `<chess-board id="matchboard" fen="" record labels></chess-board>` +
              `<div>` +
              `<div id="message"></div>` +
              `<chess-show-captured-pieces></chess-show-captured-pieces>` +
              `<chess-game-progress></chess-game-progress>` +
              `<chess-availablegames></chess-availablegames>`+
              `</div>`,
          })
        );
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
        CHESS.APIRT.createMatch({
          player_white: "WP:displayname",
          wp_user_white: 666,
          callback: ({ rowcount, rows }) => {
            log("createMatch", rows[0]);
            let {
              match_id, // match_id record id in matches table
              tournament_id,
              wp_user_white,
              wp_user_black,
              player_white,
              player_black,
              starttime,
              endtime,
              fen,
              result,
              match_guid,
            } = rows[0];

            this.initGame(match_guid);
          },
        });
      } //createMatch

      // ================================================== update matches
      updateMatch() {
        const match_id = localStorage.getItem("match_id");
        log("MATCH ID", match_id);

        const playerName = (color) => document.querySelector("chess-player-" + color).querySelector("span").innerHTML;

        CHESS.APIRT.updateMatch({
          player_white: playerName("white"),
          player_black: playerName("black"),
          callback: ({ rowcount, rows }) => {
            if (rowcount) log("updateMatch", rows[0]);
            else console.error("Geen match_id gevonden in de database");
          },
        });
      }
      // ================================================== resumeMatch
      // Gets match_id, FEN, players and their name & color
      resumeMatch(id = localStorage.getItem("match_id")) {
        this.chessboard.restart();
        this.chessboard.id = id;

        CHESS.APIRT.callAPI({
          action: "READ",
          body: { id },
          callback: ({ rows }) => {
            if (rows.length) {
              let { fen } = rows[0];
              this.chessboard.fen = fen;
              log("resumeMatch", fen);
            } else {
              console.error("Geen match_id gevonden in de database");
            }
          },
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
        CHESS.APIRT.storeChessMove({
          body:{
          id: chessboard.id, // GUID
          move,
          fromsquare,
          tosquare,
          fen,

          }
          callback: (movesaved) => {
            console.log("move saved");
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
      initGame(match_guid) {
        log("initGame", match_guid);
        this.chessboard.id = match_guid;
        this.chessboard.fen = undefined; // set start FEN
        localStorage.setItem("match_guid", match_guid);
        // this.testGame();
      }
      // ================================================== myFEN
      myFEN() {
        this.chessboard.fen = "r3kbnr/ppp2ppp/2npbq2/4p3/4P3/2NPBQ2/PPP2PPP/R3KBNR w KQkq -";
      }
      // ================================================== undoMoveDB
      undoMoveDB() {
        CHESS.APIRT.undoMove({
          id: this.match_id,
          callback: () => {
            console.log("undoMoveDB");
          },
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
