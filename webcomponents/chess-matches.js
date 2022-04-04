!(function () {
  const CSS_Boards = /* css */ `#boards{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,120px));gap:1em}`;
  const DIV_Boards = /* html */ `<div id="boards"></div>`;

  // ********************************************************** createBoard
  const createBoard = (name, records) => {
    let fen = records.slice(-1)[0].fen;
    return CHESS.createBoardElement({
      props: {
        fen,
        disabled: true,
        onmouseenter: (evt) => {
          document.querySelector(CHESS.__WC_CHESS_BOARD__).fen = fen;
        },
        onclick: (evt) => {
          if (evt.ctrlKey) {
            let chessboard = evt.target.closest("chess-board");
            fetch(CHESS.__API_SCHAAKZET__ + `delete&matchid=` + name, {
              method: "GET",
              headers: CHESS.__API_HEADERS__,
            });
            chessboard.remove();
          }
        }, // onclick
      },
    });
  };
  // ********************************************************** <chess-matches>
  customElements.define(
    "chess-matches",
    class extends CHESS.ChessBaseElement {
      constructor() {
        super().attachShadow({ mode: "open" }).innerHTML = `<style>${CSS_Boards}</style>${DIV_Boards}`;
      }
      connectedCallback() {
        this.render();
      }
      // ======================================================== <chess-matches>.render
      render() {
        let useMatchMoves = false;
        if (useMatchMoves) {
          fetch(CHESS.__API_RECORDS__ + CHESS.__API_TABLE_MATCHMOVES__, {
            method: "GET",
            headers: CHESS.__API_HEADERS__,
          })
            .then((res) => res.json())
            .then((json) => this.matchmoves2boards(json.records));
        } else {
          if (CHESS.API) {
            CHESS.API.matches.read({
              callback: (records) => {
                let boardElements = records.map(
                  ({
                    match_id, // PRIMARY KEY   - set by database
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
                        fen,
                        disabled: true,
                        onmouseenter: (evt) => {
                          document.querySelector(CHESS.__WC_CHESS_BOARD__).fen = fen;
                        },
                        onclick: (evt) => {
                          if (evt.ctrlKey) {
                            let chessboard = evt.target.closest("chess-board");
                            fetch(CHESS.__API_SCHAAKZET__ + `delete&matchid=` + name, {
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
              },
            });
          } else {
            setTimeout(this.render.bind(this), 1000);
          }
        }
      } // render()
      // ======================================================== <chess-matches>.matchmoves2boards
      matchmoves2boards(matchmoves) {
        let matchboards = matchmoves.reduce((boards, record) => {
          // reduce all JSON records to chessboards map
          let { matchmoves_id, name, move, fromsquare, tosquare, fen, time } = record;
          // ONE Map entry for every board name
          if (boards.has(name)) boards.get(name).push(record);
          else boards.set(name, [record]);

          return boards;
        }, new Map()); // reduce matchmoves

        let boardEntries = [...matchboards.entries()];

        let boardElements = boardEntries.map(([name, records]) => createBoard(name, records));

        this.shadowRoot.querySelector("#boards").append(...boardElements); // Object.assign #boards
      } // matchmoves2boards()
      // ======================================================== <chess-matches>
    } // class
  ); // customElements.define
  // ********************************************************** end IIFE
})();
