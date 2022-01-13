console.log("load <chess-execise");

customElements.define(
  "chess-exercise",
  class extends HTMLElement {
    constructor() {
      super()
        .attachShadow({ mode: "open" })
        .append(document.querySelector(`#EXERCISE1`).content.cloneNode(true));
    }

    getElement(str) {
      return this.shadowRoot.querySelector(str);
    }
    hidden(hidden = true) {
      if (hidden) this.setAttribute("hidden", "true");
      else this.removeAttribute("hidden");
    }

    connectedCallback() {
      console.error("connected");
      this.hidden(true);
      setTimeout(() => {
        this.setQuiz({});
        console.error(this.shadowRoot.querySelector(`#conclusion`));

        this.getElement("#buttons").onclick = (event) => {
          console.error(event.target.getAttribute("slot")); // dit is jouw input

          let letter = event.target.getAttribute("slot"); // bepaal de letter
          this.querySelector(`[id="A"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="B"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="C"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="D"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="E"]`).setAttribute("hidden", "true");
          this.querySelector("#" + letter).removeAttribute("hidden");
        };
      });
    }

    setQuiz() {
      let chessboard = this.getElement("#board2");
      chessboard.clear();
      chessboard.fen = this.getAttribute("fen");
    }
  }
);
