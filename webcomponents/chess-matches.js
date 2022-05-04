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
        this.render();
        // const evtSource = new EventSource("https://schaakzet.nl/api/rt/bp_test_2.php");
        // evtSource.onmessage = (evt) => {
        //   const receivedData = JSON.parse(evt.data);
        //   console.log(receivedData);
        //   this.dispatch({ name: receivedData.match_id, detail: receivedData });
        // };
      }
      // ======================================================== <chess-matches>.render
      render() {
        CHESS.API.matches.read({
          callback: (all_matchmoves_records) => {
            const setMainBoard = (guid, fen) => {
              let chessboard = document.querySelector(CHESS.__WC_CHESS_BOARD__);
              chessboard.id = guid;
              chessboard.fen = fen;
            };
            let boardElements = all_matchmoves_records
              .filter((record, idx, arr) => {
                return idx;
              }) // record.guid !== null)
              .map(
                ({
                  match_id, // PRIMARY KEY   - set by database
                  guid,
                  wp_user_white, // INT           - user id in the wp_user WordPress table
                  wp_user_black, // INT           - user id in the wp_user WordPress table
                  player_white, // VARCHAR(64)   - name of the player
                  player_black, // VARCHAR(64)   - name of the player
                  starttime, // TIMESTAMP     - when the match started - default set by database
                  endtime, // TIMESTAMP     - when the match ended - default NULL set by database
                  fen, // VARCHAR(64)   - FEN string of the chessboard, default set by database
                  result, // VARCHAR(64)   - match result, default "" set by database
                }) => {
                  return CHESS.createBoardElement({
                    props: {
                      id: guid,
                      fen,
                      disabled: true,
                      onmouseenter: (evt) => {
                        setMainBoard(guid, fen);
                      },
                      onclick: (evt) => {
                        if (evt.ctrlKey) {
                          let chessboard = evt.target.closest("chess-board");
                          fetch(CHESS.__API_SCHAAKZET__ + `delete&matchid=` + guid, {
                            method: "GET",
                            headers: CHESS.__API_HEADERS__,
                          });
                          chessboard.remove();
                        }
                      }, // onclick
                    },
                    attrs: [
                      ["player_white", player_white],
                      ["player_black", player_black],
                    ],
                  });
                }
              );
            this.shadowRoot.querySelector("#boards").append(...boardElements); // Object.assign #boards
            setTimeout(() => {
              let miniBoard = boardElements[0];
              console.error(miniBoard.fen, miniBoard.id);
              setMainBoard(miniBoard.id, miniBoard.fen);
            }, 0);
          },
        });
      } // render()
      // ======================================================== <chess-matches>
    } // class
  ); // customElements.define
  // ********************************************************** end IIFE
})();
