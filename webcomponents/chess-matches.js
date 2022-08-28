!(function () {
  const CSS_Boards = /* css */ `#boards{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,120px));gap:1em}`;
  const DIV_Boards = /* html */ `<div id="boards"></div>`;

  // ********************************************************** <chess-matches>
  customElements.define(
    "chess-matches",
    class extends CHESS.ChessBaseElement {
      constructor() {
        super().attachShadow({ mode: "open" }).innerHTML = `<style>${CSS_Boards}</style>${DIV_Boards}`;
      }
      connectedCallback() {
        super.connectedCallback();
        this.render();
        this.listen2matchmoves();
      }
      // ======================================================== <chess-matches>.render
      render() {
        setTimeout(() => {
          this.read_matches();
        });
      }
    // ======================================================== <chess-matches>.resumeChessGame
    resumeChessGame(evt) {
      let match_guid = evt.detail.data;
      let { id, displayname } = ROADSTECHNOLOGY.CHESS;

      localStorage.setItem(CHESS.__MATCH_GUID__, match_guid);
      location.assign(`match.html?id=${id}&name=${displayname}&match_guid=${match_guid}` /* , "_blank" */);
      // this.chessboard.fen = fen;
    }
      // ======================================================== <chess-matches>.read_matches
      read_matches() {
        CHESS.APIRT.callAPI({
          action: "READ",
          body: { where: "ALLGAMES" },
          callback: ({ rows }) => {
            console.error("Returned matches", rows);
            const setMainBoard = (match_guid, fen) => {
              let chessboard = document.querySelector(CHESS.__WC_CHESS_BOARD__);
              chessboard.id = match_guid;
              chessboard.fen = fen;
              chessboard.style.pointerEvents = "none";
            };
            // ------------------------------------------------- process all database boards
            console.log(rows.length, "matches read");
            let boardElements = rows
              .filter((record, idx, arr) => {
                return idx;
              }) // record.guid !== null)
              .map(
                ({
                  match_guid,
                  wp_user_white, // INT           - user id in the wp_user WordPress table
                  wp_user_black, // INT           - user id in the wp_user WordPress table
                  player_white, // VARCHAR(64)   - name of the player
                  player_black, // VARCHAR(64)   - name of the player
                  starttime, // TIMESTAMP     - when the match started - default set by database
                  endtime, // TIMESTAMP     - when the match ended - default NULL set by database
                  fen, // VARCHAR(64)   - FEN string of the chessboard, default set by database
                  result, // VARCHAR(64)   - match result, default "" set by database
                }) => {
                  // ------------------------------------------------- create miniboard
                  // set miniboard variable, so it can be use inside its code
                  let miniboard = CHESS.createBoardElement({
                    props: {
                      id: match_guid,
                      fen,
                      disabled: true,
                      onmouseenter: (evt) => {
                        console.log(miniboard.fen);
                        setMainBoard(match_guid, miniboard.fen);
                      },
                      onclick: (evt) => {
                        if (evt.ctrlKey) {
                          miniboard.remove();
                          window.CHESS.APIRT.deleteMatchByGUID({match_guid});
                        } else if (evt.shiftKey) {
                          this.resumeChessGame(match_guid, miniboard.fen);
                        }
                      }, // onclick
                    },
                    attrs: [
                      ["player_white", player_white],
                      ["player_black", player_black],
                    ],
                  });
                  return miniboard; // to boardElements Array
                }
              );
            // ------------------------------------------------- display all miniboards
            boardElements = boardElements.reverse();
            this.shadowRoot.querySelector("#boards").replaceChildren(...boardElements);

            // ------------------------------------------------- display newest miniboard on mainboard
            if (boardElements.length) {
              setTimeout(() => {
                let { id, fen } = boardElements[0];
                if (id) setMainBoard(id, fen);
              }, 100);
            }
          },
        });
      } // render()
      // ======================================================== <chess-matches>.deleteStartboards
      deleteStartboards() {
        CHESS.deleteStartboards({
          callback: (result) => {
            console.log("All startposition boards removed", result);
          },
        });
      }
      // ======================================================== <chess-matches>
    } // class
  ); // customElements.define
  // ********************************************************** end IIFE
})();
