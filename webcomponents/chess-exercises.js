console.log("load <chess-execise");
function showEXselectors() {
  document.getElementById("buttonsExercise").style.visibility = "visible";
}

// function resetQuize() {

//   document.getElementById("board2").setfen= "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
// }

// verschillende exercises aanroepen met de zelfde functie door de verschillende exercises 
// aan een parameter te koppelen. En de functie met de verschillende knoppen en de desbetreffende 
// parameter(exercise) aan te roepen

function hideAllExercises_and_Show_One(index){

  const quizNodeList = document.querySelectorAll("chess-exercise");

  quizNodeList.forEach(
    function (currentValue, currentIndex) {
      console.warn(currentIndex, currentValue);
      currentValue.hidden(true);
    },

  );
  quizNodeList[index].hidden(false);
  
}

function toren() {
  
  hideAllExercises_and_Show_One(0);
  

  document.getElementById("board2exercise").style.display = "none";
  
  return 0;
}



function paard() {
  hideAllExercises_and_Show_One(1);

  document.getElementById("board2exercise").style.display = "none";
  return 1;
}

function loper() {
  hideAllExercises_and_Show_One(2);

  document.getElementById("board2exercise").style.display = "none";
  return 2;
}

function koning() {
  hideAllExercises_and_Show_One(3);
  document.getElementById("board2exercise").style.display = "none";
  return 3;
}

function dame() {
  hideAllExercises_and_Show_One(4);
  document.getElementById("board2exercise").style.display = "none";
  return 4;
}

function pion() {
  hideAllExercises_and_Show_One(5);
  document.getElementById("board2exercise").style.display = "none";
  return 5;
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

          console.warn("is de letter er?", letter);
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

