!(function () {

  // The purpose of "use strict" is to indicate that the code should be executed in "strict mode".
  // With strict mode, you can not, for example, use undeclared variables.
  "use strict";
  
  // ********************************************************** IIFE
  customElements.define(
    "chess-game-progress",
    class extends window.CHESS.ChessBaseElement {
      connectedCallback() {
        super.connectedCallback();
        this.render();
        document.addEventListener(window.CHESS.__STORECHESSMOVE__, (evt) => this.addMove(evt.detail));
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
