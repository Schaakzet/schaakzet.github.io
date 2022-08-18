!(function () {

  // The purpose of "use strict" is to indicate that the code should be executed in "strict mode".
  // With strict mode, you can not, for example, use undeclared variables.
  "use strict";

  // <chess-match> encapsulates <chess-board>
  // manages players
  // communicates with server
  function log(...args) {
    console.log("%c chess-availablegames ", "background:blue;color:yellow", ...args);
  }

  // ********************************************************** CSS for Full Screen
  const CSS_Match = /* css */ `:fullscreen {background-color: beige}`;
  // ********************************************************** define <chess-match>
  customElements.define(
    "chess-availablegames",
    class extends window.CHESS.ChessBaseElement {
      connectedCallback() {
        super.connectedCallback();
        this.render();
      }
      // ================================================== render
      render() {
        let where = this.getAttribute("where") || "AVAILABLEGAMES";
        this.append(
          Object.assign(document.createElement("style"), {
            innerHTML: CSS_Match,
          }),
          Object.assign(document.createElement("div"), {
            innerHTML: `<h2>${where}</h2>`,
          })
        );

        this.get_availableGames(where);
      }
      // ================================================== deleteMatch
      deleteMatch(match_guid) {
        window.CHESS.APIRT.deleteMatchByGUID(match_guid);
      }
      // ================================================== get_availableGames
      get_availableGames(where) {
        // ------------------------------------------------- callAPI READ
        window.CHESS.APIRT.callAPI({
          action: "READ",
          body: {
            where,
          },
          // ------------------------------------------------- callback
          callback: ({ rows }) => {
            if (rows.length) {
              // --------------------------------------------- create matches DOM elements
              let matches = rows.map((match_row) => {
                let { 
                  tournament_id, 
                  wp_user_white,  // INT           - user id in the wp_user WordPress table
                  wp_user_black,  // INT           - user id in the wp_user WordPress table
                  player_white,   // VARCHAR(64)   - name of the player
                  player_black,   // VARCHAR(64)   - name of the player
                  starttime,      // TIMESTAMP     - when the match started - default set by database
                  endtime,        // TIMESTAMP     - when the match ended - default NULL set by database
                  fen,            // VARCHAR(64)   - FEN string of the chessboard, default set by database
                  result,         // VARCHAR(64)   - match result, default "" set by database
                  match_guid 
                } = match_row;

                // ------------------------------------------------- callAPI READ
                let gameButtons = "";
                if (where == "AVAILABLEGAMES") {
                  gameButtons = `<create-html>button|chess-availablegames:resumeChessGame:${match_guid}|play Black</create-html>`;
                }
                gameButtons += `<create-html>button|chess-availablegames:deleteMatch:${match_guid}|delete match</create-html>`;

                // ------------------------------------------------- return DOM element
                return this.$createElement({
                  tag: "div",
                  props: {
                    innerHTML: `white:<b>${player_white}</b> (wp:${wp_user_white}) ${match_guid} ${gameButtons}`,
                  },
                });
              });
              // ------------------------------------------------- append DOM elements
              this.append(...matches);
            } else {
              log("Geen matches gevonden in de database");
            }
          },
        });
      }
    } //class
  ); //customElements.define("chess-match", class extends CHESS.ChessBaseElement
  // ********************************************************** end IIFE
})();
