console.log("load <chess-execise");
function showEXselectors() {
  document.getElementById("buttonsExercise").style.visibility = "visible";
}



function hideAllExercises_and_Show_One(a, b, c, d, e, f){

  const quizNodeList = document.querySelectorAll("chess-exercise");
  document.getElementById("board2exercise").style.display = "none";

  quizNodeList.forEach(
    function (currentValue, currentIndex) {
      console.warn(currentIndex, currentValue);
      currentValue.hidden(true);
    },

  );
 quizNodeList[a].hidden(false);
 quizNodeList[b].hidden(false);
 quizNodeList[c].hidden(false);
 quizNodeList[d].hidden(false);
 quizNodeList[e].hidden(false);
 quizNodeList[f].hidden(false);
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

    connectedCallback() {
      console.error("connected");
      
      this.hidden(true);

      this.querySelector(`[id]`);
      
      setTimeout(() => {
        console.error("connected?")
        this.setQuiz({});

        
        console.error(this.shadowRoot.querySelector(`#conclusion`));
        

        this.getElementById("buttons").onclick = (event) => {
          console.error(event.target.getAttribute("slot")); // dit is jouw input
          
          let letter = event.target.getAttribute("slot"); // bepaal de letter
          this.querySelector(`[id="A"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="B"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="C"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="D"]`).setAttribute("hidden", "true");
          this.querySelector(`[id="E"]`).setAttribute("hidden", "true");
          this.querySelector("#" + letter).removeAttribute("hidden");
          
          console.warn(letter);
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
