/*
    <schaak-stuk is="wit-paard" at="D5"> Web Component
*/
customElements.define(
  "schaak-stuk",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      super.connectedCallback();
      this.render();
    }
    render() {
      this.innerHTML = `<img src="https://schaakzet.github.io/img/${this.getAttribute("is")}.png">`;
    }
  }
);

