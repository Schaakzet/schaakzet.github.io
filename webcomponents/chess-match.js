const __STORECHESSMOVE__ = "STORECHESSMOVE";
const __API_RECORDS__ = "https://schaakzet.nl/api_schaakzet_php-crud-api.php/records";
const __API_HEADERS__ = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

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
      console.warn("START MATCH");
    }
    getPlayerName(idx = 0) {
      if (idx == "white") idx = 0;
      if (idx == "black") idx = 1;
      if(idx) return "WHITE";
      else return "BLACK"
      return this.root.querySelectorAll("chess-player")[idx].value || ["W", "B"][idx];
    }
    addListeners() {
      document.addEventListener(__STORECHESSMOVE__, (evt) => this.storeMove(evt.detail));
      this.addListeners = () => {}; // attach listeners only once
    }
    storeMove({ move, fen }) {
      let uri = `${__API_RECORDS__}/matchmoves`;
      console.warn("API", move, fen, uri);
      fetch(uri, {
        method: "POST",
        headers: __API_HEADERS__,
        body: JSON.stringify({
          name: this.databaseID,
          move,
          fen,
        }),
      }).then((res) => {
        console.log(res);
      });
    }
  }
);

// <chess-player> input
// accepts name BEFORE game starts, name is used in ID in database
// assigns name

customElements.define(
  "chess-match-games",
  class extends HTMLElement {
    connectedCallback() {}
  }
);
customElements.define(
  "chess-game-progress",
  class extends HTMLElement {
    connectedCallback() {
      document.addEventListener(__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
    }
    processMoves(detail) {
      console.warn("processMoves", detail);
    }
  }
);
class ChessPlayer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<label>Name:<input type="text" placeholder="player" value="${this.getAttribute("name") || this.localName}"></label>`;
  }
}
customElements.define("chess-player-white", class extends ChessPlayer {});
customElements.define("chess-player-black", class extends ChessPlayer {});
