!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-game-progress",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        super.connectedCallback();
        this.render();
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.addMove(evt.detail));
        document.addEventListener("recordDatabaseMove", (evt) => this.addMove(evt.detail));
        document.addEventListener("restartMatch", (evt) => this.clear());
      }
      clear() {
        this.innerHTML = "";
      }
      render() {
        this.style = `display:grid;grid:1fr/1fr 1fr;gap:1em`;
      }
      addMove(detail) {
        let nr = detail.chessboard.chessMoves.length;
        this.append(
          Object.assign(document.createElement("div"), {
            innerHTML: `${nr}. ${detail.move}`,
          })
        );
      }
    }
  );
  // ********************************************************** end IIFE
})();
