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
      else {
        this.removeAttribute("hidden");
      }
    }

    connectedCallback(x) {
      console.error("connected");

      this.hidden(true);

      this.querySelector(`[id]`);

      setTimeout(() => {
        console.error("connected?");
        this.setQuiz({});

        console.error(this.shadowRoot.querySelector("#buttons"));

        this.shadowRoot.getElementById("buttons").onclick = (event) => {
          console.error(event.target.getAttribute("slot")); // dit is jouw input

          const conclusionNodeList = this.querySelectorAll(`[id]`);
          console.error("is this id", conclusionNodeList);
          conclusionNodeList.forEach(function (conclusion, currentIndex) {
            console.warn("concIndex", currentIndex, conclusion);
            
            conclusion.onclick = (evt) => {
              console.error("CONCLUSION!",evt.target);
            };
          });

          let letter = event.target.getAttribute("slot"); // bepaal de letter

          console.warn(letter);
          
          let x = this.querySelector("#" + letter).removeAttribute("hidden");

          conclusionNodeList[x];

          
        
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
