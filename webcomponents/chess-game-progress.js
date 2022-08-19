!(function () {
  // ********************************************************** IIFE
  customElements.define(
    "chess-game-progress",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        super.connectedCallback();
        this.render();

        this.nr = 1;
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => {
          this.addMove(evt.detail, this.nr);
        });
        document.addEventListener("restartMatch", (evt) => this.clear());
      }
      clear() {
        this.innerHTML = "";
      }
      render() {
        this.style = `display:grid;grid:1fr/1fr 1fr;gap:1em`;
      }

      addMove(detail, nr = 1) {
        console.log("addMove nr & evt.detail", nr, detail);
        this.append(
          Object.assign(document.createElement("div"), {
            innerHTML: `${nr}. ${detail.move}`,
          })
        );
        this.nr++;
      }
    }
  );
  // Fixed #13
  // ********************************************************** end IIFE
})();
