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

  // ********************************************************** log
  // custom log colors for this file
  function log() {
    console.log(`%c ${__COMPONENT_NAME__} `, "background:blue;color:yellow", ...arguments);
  }

  // ********************************************************** helper functions
  function matchURL(id, name, match_guid) {
    return `match.html?id=${id}&name=${name}&match_guid=${match_guid}`;
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
              innerHTML:
                /*css*/ `:fullscreen {background-color: green}` + //fullscreen doesn't work?
                this.localName +
                `{max-width:1024px}`,
            },
          }),
          this.$createElement({
            tag: "div",
            props: {
              innerHTML: /*html*/ `<h2>${this.getAttribute("title")}</h2>`,
            },
          })
        );

        this.get_availableGames(where);
      }
      // ================================================== action_resumeMatch
      action_resumeMatch(evt) {
        //! all <chess-availablegames> receive the button event
        //! so we have to check if the button clicked is in 'this' <chess-availablegames>
        //! otherwise the deletion will be done for N number of <chess-availablegames>
        let {
          //! properties in evt.detail:
          // value, // action_deleteMatch
          button, // DOM reference to button pressed
          data: match_guid, // match_guid - was defined as 1st parameter!
        } = evt.detail;
        if (this.contains(button)) {
          let { id, displayname } = ROADSTECHNOLOGY.CHESS;
          //! if no id/displayname exist, generate them
          id = id || this.getRandomID();
          if (!displayname) displayname = prompt(`(Player Black) What is your name?`);
          localStorage.setItem(CHESS.__MATCH_GUID__, match_guid);
          location.assign(matchURL(id, displayname, match_guid));
        }
      }
      // ================================================== action_viewMatch
      action_viewMatch(evt) {
        let {
          value, // action_deleteMatch
          button, // DOM reference to button pressed
          data: match_guid, // match_guid - was defined as 1st parameter!
        } = evt.detail;
        if (this.contains(button)) {
          alert("To be implemented; everyone can view existing matches");
        }
      }
      // ================================================== action_deleteMatch
      //! is deleteMatch used?
      action_deleteMatch(evt) {
        //! all <chess-availablegames> receive the button event
        //! so we have to check if the button clicked is in 'this' <chess-availablegames>
        //! otherwise the deletion will be done for N number of <chess-availablegames>
        if (this.contains(button)) {
          window.CHESS.APIRT.deleteMatchByGUID({
            match_guid: evt.detail.data, // existing match_guid
            callback: (evt) => {
              log("deleteMatch", evt);
              button.closest("div").remove(); // remove line on screen
            },
          });
        }
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
                  wp_user_black,
                  player_white,
                  player_black,
                  starttime,
                  //endtime,
                  //fen,
                  //result,
                  match_guid,
                }) => {
                  // ------------------------------------------------- callAPI READ
                  const /* function */ createHTMLButton = ({
                      label, //
                      method, // matching method on this component
                      title = label,
                      target = "",
                      className = "btn-play",
                    }) => {
                      //!! function INSIDE .map so we can use row data
                      let eventValue = this[method] && method;
                      if (eventValue) {
                        return (
                          `<create-html style="display:inline-block">button` + // create <button>
                          `|${__COMPONENT_NAME__}:${eventValue}:${match_guid}` + // Event name:value:data
                          `|${label}` + // button label
                          `|${title}` + // button title
                          `|${target}` + //! target unused in <button>
                          `|btn ${className}` + // button className
                          `</create-html>`
                        );
                      } else {
                        return `${method} not found`;
                      }
                    };
                  // ------------------------------------------------- return DOM element in map

                  const playerLink = (id, name) => {
                    return `<a href="${matchURL(id, name, match_guid)}">(${id}) ${name}</a>`;
                  };

                  // ------------------------------------------------- action buttons
                  let actionButtons = "";
                  actionButtons += createHTMLButton({ label: "View Match", method: "action_viewMatch", title: "View the game being played" });
                  actionButtons += createHTMLButton({
                    label: "Delete Match",
                    method: `action_deleteMatch`, //! is name of method in this component ``createButton above ADDS parameters!
                    title: "Quit and delete the match",
                    className: "btn btn-quit",
                  });

                  let playerWHITE = playerLink(wp_user_white, player_white);
                  let playerBLACK =
                    wp_user_black > 0
                      ? playerLink(wp_user_black, player_black) // exsiting player black
                      : createHTMLButton({ label: "Play Black", method: "action_resumeMatch", title: "Play the match as black" });
                  // ------------------------------------------------- create DOM element
                  return this.$createElement({
                    tag: "div",
                    props: {
                      innerHTML:
                        `<span class="match-guid">${match_guid}</span>` +
                        `<span class="match-player">${playerWHITE} vs. ${playerBLACK}</span>` +
                        `<span class="match-starttime">${starttime}</span>` +
                        `<span class="match-actions">${actionButtons}</span>`,
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
