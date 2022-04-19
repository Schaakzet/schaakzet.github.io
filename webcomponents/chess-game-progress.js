!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-game-progress",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => this.processMoves(evt.detail));
        document.addEventListener("restartMatch", (evt) => {
          this.innerHTML = "";
        });
      }
      processMoves(detail) {
        this.innerHTML += detail.move + "<br>";
      }
    }
  );
  // ********************************************************** end IIFE
})();
