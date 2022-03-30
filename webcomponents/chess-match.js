// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  // <chess-match> encapsulates <chess-board>
  // manages players
  // communicates with server
  customElements.define(
    "chess-match",
    class extends HTMLElement {
      get root() {
        return this.shadowRoot || this;
      }

      get databaseID() {
        return this.getPlayerName(0) + this.getPlayerName(1);
        return this._ID || (this._ID = this.getPlayerName(0) + this.getPlayerName(1));
      }

      connectedCallback() {
        this.addListeners();
        setTimeout(() => {
          console.warn("START MATCH", this.matchid);
        });
      }

      get matchid() {
        const player = (color) => document.querySelector("chess-player-" + color).value;
        return player("white") + player("black");
      }

      getPlayerName(idx = 0) {
        if (idx == "white") idx = 0;
        if (idx == "black") idx = 1;
        if (idx == 0) return "WHITE";
        else return "BLACK";
      }

      // ================================================== storeMove
      addListeners() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.storeMove(evt.detail));
        this.addListeners = () => {}; // attach listeners only once
      }

      storeMove({ chessboard, move, fromsquare, tosquare, fen }) {
        chessboard.saveFENinLocalStorage();

        chessboard.updateFENonScreen();

        fetch(CHESS.__API_RECORDS__ + CHESS.__API_TABLE_MATCHMOVES__, {
          method: "POST",
          headers: CHESS.__API_HEADERS__,
          body: JSON.stringify({
            name: chessboard.database_id,
            move,
            fromsquare,
            tosquare,
            fen,
          }),
        });
      } // storeMove

      // ================================================== createMatch
      createMatch({ chessboard, move, fromsquare, tosquare, fen }) {
        const data = new FormData();
        data.append("function", "insert");
        data.append("table", "matches");
        data.append("data[player_White]", "klaas");
        data.append("data[player_Black]", "jantje");

        fetch(CHESS.__API_MATCHES__, {
          method: "POST",
          headers: CHESS.__API_HEADERS__,
          body: data,
        })
          .then((response) => response.json())
          .then((result) => {
            console.log("success: ", result);
            $rep.innerHTML = result;
          });
      }
    }
  );
  // ********************************************************** end IIFE
})();
