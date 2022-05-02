!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-game-progress",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        this.render();
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
        document.addEventListener("restartMatch", (evt) => this.clear());
      }
      clear() {
        this.innerHTML = "";
      }
      render() {
        this.style = `display:grid;grid:1fr/1fr 1fr;gap:1em`;
      }
      processMoves(detail) {
        console.log("processMoves", detail);
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
