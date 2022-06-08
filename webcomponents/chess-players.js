!(function () {
  class ChessPlayer extends HTMLElement {
    // Has properties player_id, player_displayname and color.

    set wp_id(value) {
      this.setAttribute("id", value);
    }

    get wp_id() {
      return this.getAttribute("id");
    }

    set wp_displayname(value) {
      this.setAttribute("name", value);
      this.connectedCallback();
    }

    get wp_displayname() {
      return this.getAttribute("name");
    }

    set player_color(value) {
      this.setAttribute("color", value);
    }

    get player_color() {
      return this.getAttribute("color");
    }

    connectedCallback() {
      this.innerHTML = /*html*/ this.getAttribute("name") + `666`;
    }
  }

  customElements.define("chess-player", ChessPlayer);
})();
