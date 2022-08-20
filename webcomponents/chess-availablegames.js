!(function () {
  const __COMPONENT_NAME__ = "chess-availablegames";
  /*
  <chess-availablegames>
  (development file) seats.html lists available chessmatches with optional WHERE filter
  each match/line is created with <create-html>

  METHODS:
    get_availableGames() - internal use only
    deleteMatch() - used by button in <create-html> code

Notes:
  manages players
  communicates with server
  ! looks like deleteMatch Event is prosessed/logged twice
  !? missing: method resumeGame() - used by button in <create-html> code
*/
  const __AVAILABLEGAMES__ = "AVAILABLEGAMES"; //!! matching name in SQL backend!!

  // custom log colors for this file
  function log() {
    console.log(`%c ${__COMPONENT_NAME__} `, "background:blue;color:yellow", ...arguments);
  }

  // ********************************************************** define <chess-match>
  customElements.define(
    __COMPONENT_NAME__,
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        super.connectedCallback();
        // -------------------------------------------------- render
        let where = this.getAttribute("where") || __AVAILABLEGAMES__;

        // append/render STYLE and DIV
        this.append(
          this.$createElement({
            tag: "style",
            props: {
              //! does this work?
              innerHTML: /*css*/ `:fullscreen {background-color: green}`,
            },
          }),
          this.$createElement({
            tag: "div",
            props: {
              innerHTML: /* html */ `<h2>${where}</h2>`,
            },
          })
        );

        this.get_availableGames(where);
      }
      // ================================================== deleteMatch
      //! is deleteMatch used?
      deleteMatch(match_guid) {
        log("deleteMatch", match_guid);
        window.CHESS.APIRT.deleteMatchByGUID(match_guid);
      }
      // ================================================== get_availableGames
      get_availableGames(where) {
        // ------------------------------------------------- callAPI READ
        CHESS.APIRT.callAPI({
          action: "READ",
          body: {
            where,
          },
          // ------------------------------------------------- callback after API READ
          callback: ({ rows }) => {
            if (rows.length) {
              log(rows.length, "rows");
              // --------------------------------------------- create matches DOM elements
              const matchesHTMLArray = rows.map(
                ({
                  //!! one match row data:
                  //tournament_id, //
                  wp_user_white,
                  //wp_user_black,
                  player_white,
                  //player_black,
                  //starttime,
                  //endtime,
                  //fen,
                  //result,
                  match_guid,
                }) => {
                  // ------------------------------------------------- callAPI READ
                  const /* function */ createHTMLButton = (label, eventValue) => {
                      //!! function INSIDE .map so we can use row data
                      //! eventValue should be methods on this component?
                      return (
                        `<create-html>button` + // create <button>
                        `|${__COMPONENT_NAME__}:${eventValue}:${match_guid}` + // Event name:value:data
                        `|${label}` + // button label
                        `</create-html>`
                      );
                    };

                  // ------------------------------------------------- return DOM element in map
                  return this.$createElement({
                    tag: "div",
                    props: {
                      innerHTML:
                        `white:<b>${player_white}</b> (wp:${wp_user_white}) ${match_guid}` + //
                        (where === __AVAILABLEGAMES__
                          ? createHTMLButton("play Black (resume)", "resumeChessGame") //! missing method?
                          : "") + // no buttons for other tables
                        createHTMLButton("deleteMatch", "deleteMatch"),
                    },
                  }); // return
                }
              ); // rows.map

              // ------------------------------------------------- append DOM elements
              this.append(...matchesHTMLArray);
            } else {
              // no rows.length
              log("Geen matches gevonden in de database");
            }
          }, // callback
        }); // callAPI
      } // get_availableGames
    } // class
  ); // customElements.define

  // ********************************************************** end IIFE
})();
