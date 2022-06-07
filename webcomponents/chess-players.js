!(function () {
  class ChessPlayer extends CHESS.ChessBaseElement {
    // ======================================================== <chess-board>.observedAttributes
    static get observedAttributes() {
      return ["name"];
    }
    // Has properties player_id and player_nickname.
    constructor(id, name) {
      super();
      this.player_id = id;
      this.player_nickname = name;
    }

    connectedCallback() {
      let placeholder = this.localName;
      this.innerHTML = /*html*/ `<label>${this.getAttribute("label") || ""}<span>${this.getAttribute("name") || placeholder}</span></label>`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
      console.warn("##888##", CHESS.__WC_ATTRIBUTE_PLAYER__);
      if (oldValue && name == CHESS.__WC_ATTRIBUTE_PLAYER__) {
        this.name = newValue;
      }
    }
  }
  customElements.define("chess-player-white", class extends ChessPlayer {});
  customElements.define("chess-player-black", class extends ChessPlayer {});
})();
