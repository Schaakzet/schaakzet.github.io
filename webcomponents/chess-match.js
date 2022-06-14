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
          let match_guid = localStorage.getItem("match_guid");
          if (match_guid) {
            this.resumeMatch(match_guid);
          } else this.createMatch(); // call back-end for match_guid, then this.initGame(match_guid)
          this.addListeners();
          this.listen2matchmoves();
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
              `<h2>Match</h2>` +
              `<chess-match-buttons></chess-match-buttons>` +
              `<chess-board id="matchboard" fen="" record labels></chess-board>` +
              `<div>` +
              `<div id="message"></div>` +
              `<chess-show-captured-pieces></chess-show-captured-pieces>` +
              `<chess-game-progress></chess-game-progress>` +
              `<chess-availablegames></chess-availablegames>` +
              `<chess-availablegames where="ALLGAMES"></chess-availablegames>` +
              `</div>`,
          })
        );
      }
      // ================================================== addListeners
      addListeners() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.storeMove(evt.detail));
        document.addEventListener("createMatch", (evt) => this.createMatch(evt.detail));
        // handle game buttons
        document.addEventListener(this.localName, (e) => {
          if (this[e.detail.value]) this[e.detail.value](e);
        });
        this.addListeners = () => {}; // attach listeners only once
      }

      // ================================================== createMatch
      createMatch() {
        // ------------------------------------------------- RT API
        CHESS.APIRT.callAPI({
          action: "CREATE",
          body: { player_white: ROADSTECHNOLOGY.CHESS.displayname, wp_user_white: ROADSTECHNOLOGY.CHESS.id },
          callback: ({ rows }) => {
            log("createMatch", rows[0]);
            let { tournament_id, wp_user_white, wp_user_black, player_white, player_black, starttime, endtime, fen, result, match_guid } = rows[0];

            this.player = ROADSTECHNOLOGY.CHESS;
            console.warn("Player White:", this.player);

            this.setPlayerTitles(player_white, "2B Announced");
            this.initGame(match_guid);
          },
        });
      }

      // ================================================== setPlayerTitles()
      setPlayerTitles(p1, p2) {
        const preventEmptyName = (x) => {
          if (!x || x === "") return "onbekend";
          return x;
        };
        this.querySelector("h2").innerHTML = `Match ${preventEmptyName(p1)} vs ${preventEmptyName(p2)}`;
      }
      // ================================================== isSamePlayer
      isSamePlayer(p1, p2) {
        return Number(p1) == Number(p2);
      }
      // ================================================== resumeMatch
      // Gets match_guid, FEN, players and their name & (color)
      resumeMatch(id = localStorage.getItem("match_guid")) {
        this.chessboard.restart();
        this.chessboard.id = id;

        CHESS.APIRT.callAPI({
          action: "READ",
          body: { id },
          callback: ({ rows }) => {
            if (rows.length) {
              let matchesRow = rows[0];
              let { tournament_id, wp_user_white, wp_user_black, player_white, player_black, starttime, endtime, fen, result, match_guid } = matchesRow;
              console.warn("Row 1 returning from DB:", matchesRow);
              this.player = ROADSTECHNOLOGY.CHESS;
              if (this.isSamePlayer(this.player.id, wp_user_white)) {
                this.player.color = CHESS.__PLAYER_WHITE__;
                console.error("!!!");
              } else {
                // 2nd player is now known, store info in database
                matchesRow.wp_user_black = this.player.id;
                matchesRow.player_black = this.player.displayname;
                this.player.color = CHESS.__PLAYER_BLACK__;
                console.warn("Player Black:", this.player);
                this.updatePlayers(matchesRow);
                this.startMatch();
              }
              this.chessboard.player = this.player.color;
              this.chessboard.fen = fen;
              this.setPlayerTitles(player_white, player_black);
              log("resumeMatch", fen);
            } else {
              // oude GUID in LocalStorage, maar niet in DB
              localStorage.removeItem("match_guid");
              this.createMatch();
            }
          },
        });
      }
      // ================================================== startMatch
      startMatch(id = localStorage.getItem("match_guid")) {
        // ask database if there are matchmoves entries
        // only if there are no matchmoves entries, then start game
        CHESS.APIRT.callAPI({
          action: "MOVES",
          body: { id },
          callback: ({ rows }) => {
            let noMovesYet = rows.length == 0;
            if (noMovesYet) {
              this.chessboard.recordMoveInDatabase({ move: "startgame" });
            }
          },
        });
      }
      // ================================================== updatePlayers
      updatePlayers({
        match_guid, // matchesRow
        wp_user_white,
        wp_user_black,
        player_white,
        player_black,
      }) {
        CHESS.APIRT.callAPI({
          action: "UPDATE",
          body: {
            match_guid, // GUID
            wp_user_white,
            wp_user_black,
            player_white,
            player_black,
          },
          callback: ({ rows }) => {
            let { player_white, player_black } = rows[0];
            this.setPlayerTitles(player_white, player_black);
          },
        });
      }

      // ================================================== storeMove
      storeMove({
        chessboard = this.chessboard, //
        move = "e2-e4",
        fen = chessboard.fen,
      }) {
        console.error("FEN", fen);
        log("storeMove", move, chessboard.id);
        chessboard.saveFENinLocalStorage();
        chessboard.updateFENonScreen();

        CHESS.APIRT.callAPI({
          action: "CHESSMOVE",
          body: {
            id: chessboard.id, // GUID
            move,
            fen,
          },

          callback: ({ rows }) => {
            log("move saved", rows);
          },
        });
      }
      // ================================================== initGame
      initGame(match_guid) {
        log("initGame", match_guid);
        this.chessboard.id = match_guid;
        this.chessboard.fen = undefined; // set start FEN
        localStorage.setItem("match_guid", match_guid);
      }
      // ================================================== myFEN
      myFEN() {
        this.chessboard.fen = "r3kbnr/ppp2ppp/2npbq2/4p3/4P3/2NPBQ2/PPP2PPP/R3KBNR w KQkq -";
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
      // ================================================== undoMoveDB
      undoMoveDB() {
        CHESS.APIRT.undoMove({
          id: this.match_guid,
          callback: () => {
            log("undoMoveDB");
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
