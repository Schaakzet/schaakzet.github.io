console.log("load <chess-execise");
function showEXselectors() {
  document.getElementById("buttonsExercise").style.visibility = "visible";
}

function hideAllExercises_and_Show_One(a) {
  console.log("a=", a);
  const quizNodeList = document.querySelectorAll("chess-exercise");
  document.getElementById("board2exercise").style.display = "none";

  quizNodeList.forEach(function (exercise, currentIndex) {
    console.warn("WAARDE:", currentIndex, exercise);
    exercise.hidden(true);
  });
  quizNodeList[a].hidden(false);
}

customElements.define(
  "chess-exercise",
  class extends window.CHESS.ChessBaseElement {
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
      else {
        this.removeAttribute("hidden");
      }
    }

    connectedCallback() {
      super.connectedCallback();

      console.error("connected");

      this.hidden(true);

      this.querySelector(`[id]`);

      setTimeout(() => {
        
        this.setQuiz({});

        console.error(this.shadowRoot.querySelector("#buttons"));

        this.shadowRoot.getElementById("buttons").onclick = (event) => {
          const conclusionNodeList = this.querySelectorAll(`[id]`);
         
          conclusionNodeList.forEach(function (conclusion, currentIndex) {
            console.warn("concIndex", currentIndex, conclusion);
            conclusion.setAttribute("hidden", "true");
          });

          let letter = event.target.getAttribute("slot"); // bepaal de letter

          

          this.querySelector("#" + letter).removeAttribute("hidden");

          
        };
      });
    }

    setQuiz() {
      let chessboard = this.getElement("#board2");
      chessboard.clear();
      chessboard.fen = this.getAttribute("fen");
      console.error(chessboard);
    }
  }
);
