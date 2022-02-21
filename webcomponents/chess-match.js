// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
  const __STORECHESSMOVE__ = "STORECHESSMOVE";
  const __API_RECORDS__ = "https://schaakzet.nl/api_schaakzet_php-crud-api.php/records";
  const __API_TABLE_MATCHMOVES__ = "matchmoves";
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
        if (idx) return "WHITE";
        else return "BLACK";
        return this.root.querySelectorAll("chess-player")[idx].value || ["W", "B"][idx];
      }
      addListeners() {
        document.addEventListener(__STORECHESSMOVE__, (evt) => this.storeMove(evt.detail));
        this.addListeners = () => {}; // attach listeners only once
      }
      storeMove({ chessboard, moves, move, fromsquare, tosquare, fen }) {
        if (chessboard.record) {
          let uri = `${__API_RECORDS__}/` + __API_TABLE_MATCHMOVES__;
          console.warn("API", move, fen, uri);
          fetch(uri, {
            method: "POST",
            headers: __API_HEADERS__,
            body: JSON.stringify({
              name: chessboard.database_id,
              move,
              fromsquare,
              tosquare,
              fen,
            }),
          }).then((res) => {
            //console.log(res);
          });
        } // if record
      }
    }
  );

  // <chess-player> input
  // accepts name BEFORE game starts, name is used in ID in database
  // assigns name

  customElements.define(
    "chess-match-games",
    class extends HTMLElement {
      constructor() {
        super().attachShadow({ mode: "open" }).innerHTML =
          `<style>#boards{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 120px));
        gap:1em;
      }</style>` + `<div id="boards"></div>`;
      }
      connectedCallback() {
        this.render();
      }
      render() {
        let uri = `${__API_RECORDS__}/` + __API_TABLE_MATCHMOVES__;
        console.warn("API", uri);
        fetch(uri, {
          method: "GET",
          headers: __API_HEADERS__,
        })
          .then((res) => res.json())
          .then((json) => {
            let boards = json.records.reduce((boardsMap, record) => {
              let { matchmoves_id: id, name, move, fromsquare, tosquare, fen, time } = record;
              if (boardsMap.has(name)) {
                boardsMap.get(name).push(record);
              } else {
                boardsMap.set(name, [record]);
              }
              return boardsMap;
            }, new Map());
            let boardsHTML = [...boards.entries()]
              .map(([name, records]) => {
                let record = records.slice(-1)[0];
                let { matchmoves_id: id, move, fromsquare, tosquare, fen, time } = record;
                console.error(name, fen);
                return `<chess-board fen="${record.fen}"></chess-board>`;
              })
              .join("");
            this.shadowRoot.querySelector("#boards").innerHTML = boardsHTML;
          });
      } // render()
    }
  );
  customElements.define(
    "chess-game-progress",
    class extends HTMLElement {
      connectedCallback() {
        document.addEventListener(__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
      }
      processMoves(detail) {
        console.warn("processMoves", detail.chessPiece.fen, detail);
      }
    }
  );
  class ChessPlayer extends HTMLElement {
    connectedCallback() {
      let placeholder = this.localName;
      this.innerHTML = /*html*/ `<label>${this.getAttribute("label")||""}<input type="text" placeholder="${placeholder}" value="${this.getAttribute("name") || ""}"></label><span></span>`;
      let input = this.querySelector("input");
      const showinput = (state) => {
        let name = "";
        if (state) {
          input.style.display = "inherit";
          input.focus();
          input.setSelectionRange(0, input.value.length);
          this.querySelector("span").innerHTML = "";
          input.selectionStart = input.selectionEnd = 10000;
        } else {
          input.style.display = "none";
          name = input.value || placeholder;
        }
        this.querySelector("span").innerHTML = name;
      };
      showinput(!this.hasAttribute("name"));
      this.onkeyup = (evt) => evt.keyCode == 13 && showinput(false);
      this.onclick = (evt) => showinput(true);
      input.onblur = (evt) => showinput(false);
    }
  }
  customElements.define("chess-player-white", class extends ChessPlayer {});
  customElements.define("chess-player-black", class extends ChessPlayer {});
  // end IIFE
})();
