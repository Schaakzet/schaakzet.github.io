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
        this.append(
          Object.assign(document.createElement("style"), {
            innerHTML: CSS_Match,
          }),
          Object.assign(document.createElement("div"), {
            innerHTML: `<h2>Available games</h2>`,
          })
        );

        this.get_availableGames();
      }
      // ================================================== get_availableGames
      get_availableGames() {
        log("get_availableGames");
        CHESS.APIRT.callAPI({
          action: "READ",
          body: {
            where: "AVAILABLEGAMES",
          },
          callback: ({ rows }) => {
            log(rows.length, rows);
            if (rows.length) {
              let matches = rows.map((match) => {
                let { match_guid } = match;
                return this.$createElement({
                  tag: "div",
                  props: {
                    innerHTML: match_guid,
                    onclick: (evt) => this.resumeChessGame(match_guid),
                  },
                });
              });
              log(matches);
              this.append(...matches);
            } else {
              console.error("Geen matches gevonden in de database");
            }
          },
        });
      }
    } //class
  ); //customElements.define("chess-match", class extends CHESS.ChessBaseElement
  // ********************************************************** end IIFE
})();
