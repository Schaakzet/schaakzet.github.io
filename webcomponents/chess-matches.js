!(function () {
  const CSS_Boards = /* css */ `#boards{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,120px));gap:1em}`;
  const DIV_Boards = /* html */ `<div id="boards"></div>`;

  // ********************************************************** createBoard
  const createBoard = (name, records) => {
    return CHESS.createBoardElement({
      fen: records.slice(-1)[0].fen,
      onmouseenter: (evt) => {
        document.querySelector(CHESS.__WC_CHESS_BOARD__).fen = fen;
      },
      onclick: (evt) => {
        fetch(__API_SCHAAKZET__ + `delete&matchid=` + name, {
          method: "GET",
          headers: __API_HEADERS__,
        });
        chessboard.remove();
      }, // onclick
    });
  };
  // ********************************************************** <chess-matches>
  customElements.define(
    "chess-matches",
    class extends HTMLElement {
      constructor() {
        super().attachShadow({ mode: "open" }).innerHTML = `<style>${CSS_Boards}</style>${DIV_Boards}`;
      }
      connectedCallback() {
        this.render();
      }
      // ======================================================== <chess-matches>.render
      render() {
        fetch(CHESS.__API_RECORDS__ + CHESS.__API_TABLE_MATCHMOVES__, {
          method: "GET",
          headers: CHESS.__API_HEADERS__,
        })
          .then((res) => res.json())
          .then((json) => this.matchmoves2boards(json.records));
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
