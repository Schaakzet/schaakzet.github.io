!(function () {
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
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
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
            innerHTML: `<h2>${where} games</h2>`,
          })
        );

        this.get_availableGames(where);
      }
      // ================================================== get_availableGames
      get_availableGames(where) {
        CHESS.APIRT.callAPI({
          action: "READ",
          body: {
            where,
          },
          callback: ({ rows }) => {
            if (rows.length) {
              let matches = rows.map((match) => {
                let { tournament_id, wp_user_white, wp_user_black, player_white, player_black, starttime, endtime, fen, result, match_guid } = match;
                return this.$createElement({
                  tag: "div",
                  props: {
                    innerHTML: `white:<b>${player_white}</b> (wp:${wp_user_white}) ${match_guid}`,
                    onclick: (evt) => this.resumeChessGame(match_guid),
                  },
                });
              });
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
