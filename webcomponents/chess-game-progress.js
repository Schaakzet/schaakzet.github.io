!(function () {
  const __COMPONENT_NAME__ = "chess-game-progress";

  // ********************************************************** logging
  // the amount of console.logs displayed in this component
  let logDetailComponent = 1; //! -1=no logs 0=use global setting >0=custom setting
  let logComponent = window.CHESS.log[__COMPONENT_NAME__];
  let logDetail = logDetailComponent || logComponent.detail;
  function log() {
    console.logColor &&
      console.logColor(
        {
          name: __COMPONENT_NAME__,
          background: "darkgoldenrod",
          ...logComponent,
        },
        ...arguments
      );
  }

  // ********************************************************** <chess-game-progress>
  customElements.define(
    __COMPONENT_NAME__,
    class extends CHESS.ChessBaseElement {
      // ======================================================== <chess-game-progress>.connectedCallback
      connectedCallback() {
        super.connectedCallback();
        this.render();

        this.nr = 1;
        document.addEventListener(CHESS.__STORECHESSMOVE__, (evt) => {
          this.addMove(evt.detail, this.nr);
        });
        document.addEventListener("restartMatch", (evt) => this.clear());
      }
      // ======================================================== <chess-game-progress>.clear
      clear() {
        this.innerHTML = "";
      }
      // ======================================================== <chess-game-progress>.render
      render() {
        this.style = `display:grid;grid:1fr/1fr 1fr;gap:1em`;
      }
      // ======================================================== <chess-game-progress>.addMove
      addMove(detail, nr = 1) {
        if (logDetail > 0) log("addMove nr & evt.detail", nr, {detail});
        this.append(
          Object.assign(document.createElement("div"), {
            innerHTML: `${nr}. ${detail.move}`,
          })
        );
        this.nr++;
      } // addMove
    } // class <chess-game-progress>
  ); // customElements.define
  // ********************************************************** end IIFE
})();
