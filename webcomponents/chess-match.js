!(function () {
  // <chess-match> encapsulates <chess-board>
  // manages players
  // communicates with server

  const __COMPONENT_NAME__ = "chess-match";

  // ********************************************************** logging

  // the amount of console.logs displayed in this component
  let logDetailComponent = 1; //! -1=no logs 0=use global setting >0=custom setting
  let logComponent = window.CHESS.log[__COMPONENT_NAME__];
  let logDetail = logDetailComponent || logComponent.detail;

  function log() {
    console.logColor &&
      console.logColor(
        {
          name: __COMPONENT_NAME__,
          background: "lightgreen",
          color: "black",
          ...logComponent,
          // stacktrace: true,
        },
        ...arguments
      );
  }

  // ********************************************************** CSS for Full Screen
  const CSS_Match = /* css */ `:fullscreen {background-color: beige}`;
  // ********************************************************** define <chess-match>
  customElements.define(
    __COMPONENT_NAME__,
    class extends CHESS.ChessBaseElement {
      // todo create shadowDOM?
      // ================================================== <chess-match>.connectedCallback
      connectedCallback() {
        super.connectedCallback();
        this.render();

        setTimeout(() => {
          let match_guid = localStorage.getItem(CHESS.__MATCH_GUID__) || URLSearchParam("match_guid");
          if (match_guid) {
            this.resumeMatch(match_guid);
          } else {
            this.createMatch(); // call back-end for match_guid, then this.initGame(match_guid)
          }
          this.addListeners();
          this.listen2matchmoves(this);
        });
      }
      // ================================================== <chess-match>. get chessboard
      get chessboard() {
        // todo find chessboard inside shadowDOM?
        if (this._chessboard) return this._chessboard;
        return (this._chessboard = document.querySelector("chess-board") || console.error("Missing chess-board"));
      }
      // ================================================== <chess-match>.render
      render() {
        let doAnalysis = CHESS.__DO_BOARD_ANALYSIS__;
        doAnalysis = "NOANALYSIS";
        this.append(
          Object.assign(document.createElement("style"), {
            innerHTML: CSS_Match,
          }),
          Object.assign(document.createElement("div"), {
            innerHTML:
              (this.hasAttribute("buttons") ? `<chess-match-buttons></chess-match-buttons>` : ``) +
              (this.hasAttribute("playernames") ? `<div class="match_playernames"></div>` : ``) +
              `<div id="match_and_progress">` +
              `  <div>` +
              `    <chess-board record labels ${doAnalysis}></chess-board>` +
              `    <div id="TEST4CHECKBOARDS" style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 1em"></div>` +
              `  </div>` +
              `  <div>` +
              `    <chess-captured-pieces></chess-captured-pieces>` +
              `    <chess-game-progress></chess-game-progress>` +
              `  </div>` +
              `</div>` +
              `<div id="message"></div>`,
          })
        );
      }
      // ================================================== <chess-match>.addListeners
      addListeners() {
        document.addEventListener("newGame", (evt) => this.createMatch(evt.detail));
        // handle game buttons
        this.addListeners = () => {}; // attach listeners only once
      }

      // ================================================== <chess-match>.createMatchPlayer
      createMatchPlayer(player_id, player_name, player_color) {
        window.initRoadsTechnologyPlayer(
          URLSearchParam("id") || this.getRandomID(), // id
          URLSearchParam("name") || prompt("Enter your Displayname", "Anonymous")
        );
      }
      // ================================================== <chess-match>.createMatch
      createMatch() {
        if (logDetail > 0) log("createMatch");
        this.createMatchPlayer();

        let { id, displayname } = ROADSTECHNOLOGY.CHESS;
        if (confirm("Do you want to start a new match as player white?")) {
          // -------------------------------------------------- callAPI
          CHESS.APIRT.callAPI({
            action: "CREATE",
            body: {
              wp_user_white: id, // user WordPress wp_user.id
              player_white: displayname, // user "name"
            },
            // -------------------------------------------------- callback
            callback: ({ rows }) => {
              // todo test for database failure, no rows
              let {
                tournament_id,
                wp_user_white,
                wp_user_black,
                player_white, // for now a new match is always created by the white player
                player_black,
                starttime,
                endtime,
                fen,
                result,
                match_guid, // matchGUID assigned by database
              } = rows[0];

              if (logDetail > 0) log("callback createMatch", match_guid);
              this.setPlayerTitles(player_white, player_black, wp_user_white, wp_user_black);
              this.initGame(match_guid);
            },
          });
        } else {
          // JOIN MATCH
          // Take wp_user_black and player_black:
          let wp_user_black = id;
          let player_black = displayname;
          // show availableGames (seats.html):
          location.assign(`seats.html?id=${wp_user_black}&name=${player_black}`);
        }
      }

      // ================================================== <chess-match>.setPlayerTitles()
      setPlayerTitles(p1, p2 = "<i>To Be Announced</i>", wp_user_white, wp_user_black) {
        const match_playernames = this.querySelector(".match_playernames");
        if (match_playernames) {
          function preventEmptyName(name) {
            if (!name || name == "") return "<i>onbekend</i>";
            return name;
          }
          match_playernames.innerHTML = `Match ${preventEmptyName(p1)} (${wp_user_white}) vs ${preventEmptyName(p2)} (${wp_user_black})`;
        }
      }
      // ================================================== <chess-match>.isSamePlayer
      isSamePlayer(p1, p2) {
        return Number(p1) == Number(p2);
      }
      // ================================================== <chess-match>.assignPlayerByMatchesRow
      assignPlayerByMatchesRow(matchesRow) {
        // todo : Check again whether this function does what it is supposed to do.
        // -------------------------------------------------- fancy console.log
        function consoleLog(playerColor) {
          console.groupCollapsed(
            `%c resumeMatch %c player: ${playerColor} (${ROADSTECHNOLOGY.CHESS.id}) ${ROADSTECHNOLOGY.CHESS.displayname} `, //
            "background:lightgreen",
            "background:" + (playerColor === "WHITE" ? "white;color:black" : "black;color:white") + ";font-size:130%",
            fen
          );
          log("matchesRow", matchesRow);
          console.groupEnd();
        }
        // end function consoleLog

        if (logDetail > 0) log("assignPlayerByMatchesRow", matchesRow);
        // -------------------------------------------------- init variables
        let {
          tournament_id,
          wp_user_white, // WordPress wp_user.id
          wp_user_black, // WordPress wp_user.id
          player_white,
          player_black,
          starttime,
          endtime,
          fen, // FEN string from database table Matches
          result,
          match_guid,
        } = matchesRow;
        // -------------------------------------------------- determine current player
        //! TODO use generic code
        window.initRoadsTechnologyPlayer(); //set ROADSTECHNOLOGY.CHESS.player stuff (by global function in schaakzet.js file)

        let localStoragePlayer = localStorage.getItem("match_player");
        if (localStoragePlayer) {
          if (localStoragePlayer == CHESS.__PLAYER_WHITE__) {
            ROADSTECHNOLOGY.CHESS.displayname = player_white;
            ROADSTECHNOLOGY.CHESS.id = wp_user_white;
          } else {
            ROADSTECHNOLOGY.CHESS.displayname = player_black;
            ROADSTECHNOLOGY.CHESS.id = wp_user_black;
          }
        }

        if (logDetail > 0) log("User:", ROADSTECHNOLOGY.CHESS, "player_white:", player_white);

        let { id, displayname } = ROADSTECHNOLOGY.CHESS;

        // let playerName = prompt(`Match: ${player_white} VS ${player_black} Enter your previous display name`);

        if (ROADSTECHNOLOGY.CHESS.displayname == player_white) {
          consoleLog("WHITE");
          this.chessboard.player = CHESS.__PLAYER_WHITE__;
          if (logDetail > 0) log("chessboard.player", this.chessboard.player);
          // this.updateProgressFromDatabase({ match_guid });
          this.updatePlayersinDatabase({
            ...matchesRow, // all of matchesRow
            wp_user_white: id, // overwrite wp_user_white with WordPress_id
            player_white: displayname, // overwrite player_white with WordPress_displayname
          });
        } else {
          consoleLog("BLACK");
          this.chessboard.player = CHESS.__PLAYER_BLACK__;
          // this.updateProgressFromDatabase({ match_guid });
          this.updatePlayersinDatabase({
            ...matchesRow, // all of matchesRow
            wp_user_black: id, // overwrite wp_user_black with WordPress_id
            player_black: displayname, // overwrite player_black with WordPress_displayname
          });
        }
        console.log(666,this.chessboard)
        localStorage.setItem("match_player", this.chessboard.player);

        // -------------------------------------------------- init <chess-board>
        this.setPlayerTitles(player_white, player_black, wp_user_white, wp_user_black);
        this.chessboard.setPlayerAndFEN(this.chessboard.player, fen); // set attribute on <chess-board> set pieces on <chess-board>
      }

      // ================================================== <chess-match>.resumeMatch
      // Gets match_guid, FEN, players and their name & (color)
      resumeMatch(match_guid) {
        if (logDetail > 0) log("resumeMatch", match_guid);
        this.chessboard.resume(match_guid);
        // -------------------------------------------------- callAPI
        CHESS.APIRT.callAPI({
          action: "READ",
          body: { id: match_guid },
          // -------------------------------------------------- callback
          callback: ({ rows }) => {
            if (rows.length) {
              this.assignPlayerByMatchesRow(rows[0]);
            } else {
              localStorage.removeItem(CHESS.__MATCH_GUID__);
              this.createMatch();
            }
          },
        });
      }
      // ================================================== <chess-match>.startMatch_send_startgame_to_database
      startMatch_send_startgame_to_database(
        id = localStorage.getItem(CHESS.__MATCH_GUID__) || this.chessboard.id // match_guid
      ) {
        // ask database if there are matchmoves entries
        // only if there are no matchmoves entries, then start game
        CHESS.APIRT.callAPI({
          action: "MOVES", // vraag moves van deze match_guid
          body: { id },
          callback: ({ rows }) => {
            let noMovesYet = rows.length == 0;
            if (noMovesYet) {
              // player BLACK tells player WHITE to start the game:
              this.storeMove({
                move: CHESS.APIRT.__STARTGAME__, // "startgame"
              });
            } else {
              this.updateProgressFromDatabase({ rows });
            }
          },
        });
      }
      // ================================================== <chess-match>.updateProgressRow
      updateProgressRow({
        matchmoves_id, //
        match_guid,
        fromsquare,
        tosquare,
        move,
        fen,
        tournament_id,
      }) {
        let chessboard = this.chessboard;
        if (logDetail > 0) log("updateProgressRow", fromsquare, tosquare, "move:", move);
        chessboard.checkif_capturePiece(move);
        let moves = (chessboard.moves = []);
        const isValidMove = !(move == CHESS.APIRT.__STARTGAME__ || move == CHESS.APIRT.__UNDOMOVE__);
        //! vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        //! Don't accept e8xe8 moves (NxN) from the database
        if (fromsquare == tosquare) {
          console.error("ignoring move", move);
          return;
        }
        //! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        const isNewMove = !moves.includes(move);
        moves.push(move);
        if (isValidMove && isNewMove) {
          if (logDetail > 0) log("updateProgressRow : adding chessMove", move, "isUpdating:", chessboard.isUpdating);
          chessboard.addChessMove({
            chessPiece: chessboard.getPiece(tosquare), // database does not know which piece it is
            //! NOTE: database fieldnames are lowercase, <chess-board> parameter camelCase
            fromSquare: fromsquare,
            toSquare: tosquare,
            fen,
            move,
          });
          if (logDetail > 1) log(move, fromsquare, tosquare);
          //chessboard.dispatchChessMove({ fromsquare, tosquare, move });

          //! vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
          if (chessboard.isUpdating) {
            //console.error("BOARD isUpdating! CALL GUID LISTENER HERE? Or just set FEN", fen);
            chessboard.fen = fen;
            chessboard.dispatchChessMove({
              fromSquare: fromsquare, //! WHY DO THE NAMES NOT MATCH????
              toSquare: tosquare,
              move,
            });
          } else {
            //! MOVE IS MADE BY A PLAYER
            chessboard.dispatch_GUID({ fen, move });
          }
          //! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        } else {
          switch (move) {
            case CHESS.APIRT.__STARTGAME__:
            case CHESS.APIRT.__UNDOMOVE__:
              break;
            default:
              console.error("Invalid move", move, moves);
          }
        }
      }
      // ================================================== updateProgressFromDatabase
      updateProgressFromDatabase({
        rows = false, // if false then call database again with match_guid
        match_guid = localStorage.getItem(CHESS.__MATCH_GUID__),
      }) {
        let chessboard = this.chessboard;
        if (logDetail > 1) log("ROWS:", rows);

        const /*function*/ processDatabaseRows = (rows) => {
            if (logDetail > 1) log("Update progress from ", rows.length, "database rows");
            CHESS.log.fen(this, "processDatabaseRows", undefined);
            chessboard.fen = undefined; //! make sure we start with a start board
            chessboard.isUpdating = true;
            this.logMoves = [];
            //!! groupCollapsed does not work on FireFox!
            console.group("processDatabaseRows");
            rows.forEach((row) => {
              this.updateProgressRow(row); //! all moves are forced to the next Event Loop
            });
            chessboard.showLastMoveOnBoard();

            //! vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
            //! FORCE isUpdating to false AFTER all moves are added to the board
            setTimeout(() => {
              console.groupEnd("processDatabaseRows", this.logMoves);
              chessboard.isUpdating = false;
              chessboard.ready_for_play();
            });
            //! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          };

        if (rows) processDatabaseRows(rows);
        else
          CHESS.APIRT.callAPI({
            action: "MOVES",
            body: { id: match_guid },
            callback: ({ rows }) => processDatabaseRows(rows),
          });
      }
      // ================================================== updatePlayers_inDatabase
      updatePlayersinDatabase({
        match_guid, // matchesRow
        wp_user_white,
        wp_user_black,
        player_white,
        player_black,
      }) {
        if (player_white == "null") player_white = "PlayerWhite";
        if (player_black == "null") player_black = "PlayerBlack";
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
            let { player_white, player_black, wp_user_white, wp_user_black } = rows[0];
            this.setPlayerTitles(player_white, player_black, wp_user_white, wp_user_black);
            this.startMatch_send_startgame_to_database(); // let other player know that we are ready
          },
        });
      }

      // ================================================== storeMove
      storeMove({
        chessboard = this.chessboard, //
        move = "e2-e4",
        fen = chessboard.fen,
      }) {
        log("storeMove", move);
        if (chessboard.isUpdating) {
          console.error("chessboard.isUpdating prevents storing moves");
          return;
        }
        if (logDetail > 2) log("callstack", new Error().stack);
        if (logDetail > 0) log("storeMove", move, fen);
        // chessboard.updateFENonScreen();
        // -------------------------------------------------- callAPI
        CHESS.APIRT.callAPI({
          action: "CHESSMOVE",
          body: {
            id: chessboard.id, // GUID
            move,
            fen,
          },
          // -------------------------------------------------- callback
          callback: ({ rows }) => {
            log("move saved", rows[0].move, rows);
          },
        });
      }
      // ================================================== undoLastMove
      undoLastMove() {
        let chessboard = this.chessboard;
        CHESS.APIRT.callAPI({
          action: "UNDOMOVE",
          body: {
            id: chessboard.id, // GUID
          },
          callback: () => {
            log("undoLastMove", ...arguments);
          },
        });
        chessboard.reload();
      }
      // ================================================== initGame
      initGame(match_guid) {
        log("initGame", match_guid);
        this.chessboard.id = match_guid;
        this.chessboard.fen = undefined; // set start FEN
        localStorage.setItem(CHESS.__MATCH_GUID__, match_guid);
      }
      // ================================================== myFEN
      myFEN() {
        this.chessboard.fen = "r3kbnr/ppp2ppp/2npbq2/4p3/4P3/2NPBQ2/PPP2PPP/R3KBNR w KQkq -";
      }
      // ================================================== removeMatch
      removeMatch() {
        localStorage.removeItem(CHESS.__MATCH_GUID__);
        location.reload();
      }
      // ================================================== mockMove
      mockMove() {
        let move = localStorage.getItem("mockMove") || "d4xc5";
        move = window.prompt("Enter move (like: e2-e4)", move);
        if (move) {
          localStorage.setItem("mockMove", move); // store user entry as default
          this.chessboard.mockMove(move);
        }
      }
      // ================================================== undoMove
      undoMove() {
        let chessboard = this.chessboard;
        log("UNDO MOVE"); //todo test
        chessboard.dispatchChessMove({ move: CHESS.__UNDOMOVE__ });
        // -------------------------------------------------- dispatch undoMove
        this.dispatch({
          root: document,
          name: CHESS.__UNDOMATCHMOVE__,
          detail: {
            chessboard: chessboard,
            toSquare: chessboard.lastMove.toSquare,
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
      // ================================================== fullscreen
      fullScreen() {
        var elem = this;

        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          /* Safari */
          elem.webkitRequestFullscreen();
        }
      }
      // ================================================== forceBlackPlayer
      forceBlackPlayer() {
        this.updatePlayersinDatabase({
          match_guid: this.chessboard.id,
          wp_user_white: ROADSTECHNOLOGY.CHESS.id,
          wp_user_black: this.getRandomID(),
          player_white: ROADSTECHNOLOGY.CHESS.displayname,
          player_black: "FORCED BLACK PLAYER",
        });
      }
    } //class
  ); //customElements.define("chess-match", class extends CHESS.ChessBaseElement
  // ********************************************************** end IIFE
})();
