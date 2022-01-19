console.log("load <chess-execise");
function showEXselectors(){
  document.getElementById("buttonsExercise").style.visibility = "visible";
}

function toren() {
  document.getElementById("board2exercise").style.display = "none";
  document.querySelectorAll("chess-exercise")[0].hidden(false);
  
  document.querySelectorAll("chess-exercise")[1].hidden(true);
  document.querySelectorAll("chess-exercise")[2].hidden(true);
  document.querySelectorAll("chess-exercise")[3].hidden(true);
  document.querySelectorAll("chess-exercise")[4].hidden(true);
}

function paard() {
  document.getElementById("board2exercise").style.display = "none";
  document.querySelectorAll("chess-exercise")[1].hidden(false);

  document.querySelectorAll("chess-exercise")[0].hidden(true);
  document.querySelectorAll("chess-exercise")[2].hidden(true);
  document.querySelectorAll("chess-exercise")[3].hidden(true);
  document.querySelectorAll("chess-exercise")[4].hidden(true);
  document.querySelectorAll("chess-exercise")[5].hidden();
}

function loper() { 
  document.getElementById("board2exercise").style.display = "none";
  document.querySelectorAll("chess-exercise")[2].hidden(false);

  document.querySelectorAll("chess-exercise")[0].hidden(true);
  document.querySelectorAll("chess-exercise")[1].hidden(true);
  document.querySelectorAll("chess-exercise")[3].hidden(true);
  document.querySelectorAll("chess-exercise")[4].hidden(true);
  document.querySelectorAll("chess-exercise")[5].hidden(true);
}

function koning() {
  document.getElementById("board2exercise").style.display = "none";
  document.querySelectorAll("chess-exercise")[3].hidden(false);

  document.querySelectorAll("chess-exercise")[0].hidden(true);
  document.querySelectorAll("chess-exercise")[1].hidden(true);
  document.querySelectorAll("chess-exercise")[2].hidden(true); 
  document.querySelectorAll("chess-exercise")[4].hidden(true); 
  document.querySelectorAll("chess-exercise")[5].hidden(true);
}

function dame() {
  document.getElementById("board2exercise").style.display = "none";
  document.querySelectorAll("chess-exercise")[4].hidden(false);

  document.querySelectorAll("chess-exercise")[0].hidden(true);
  document.querySelectorAll("chess-exercise")[1].hidden(true);
  document.querySelectorAll("chess-exercise")[2].hidden(true); 
  document.querySelectorAll("chess-exercise")[3].hidden(true);
  document.querySelectorAll("chess-exercise")[5].hidden(true);
}

function pion() {
  document.getElementById("board2exercise").style.display = "none";
  document.querySelectorAll("chess-exercise")[5].hidden(false);

  document.querySelectorAll("chess-exercise")[0].hidden(true);
  document.querySelectorAll("chess-exercise")[1].hidden(true);
  document.querySelectorAll("chess-exercise")[2].hidden(true); 
  document.querySelectorAll("chess-exercise")[3].hidden(true);
  document.querySelectorAll("chess-exercise")[4].hidden(true);
  
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
      else { this.removeAttribute("hidden");
      
    }
    }

    
    
    connectedCallback() {
      console.error("connected");
      this.hidden(true);
      
      this.querySelector(`[id]`)




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

// customElements.define(
//   "chess-exerciseSelector",
//   class extends HTMLElement {
//     constructor() {
//       super()
//         .attachShadow({ mode: "open" })
//         .append(document.querySelector(`#exerciseSelector`).content.cloneNode(true));
//     }

//     getElement(str) {
//       return this.shadowRoot.querySelector(str);
//     }
//     hidden(hidden = true) {
//       if (hidden) this.setAttribute("hidden", "true");
//       else { this.removeAttribute("hidden");
      
//     }
//     }



//     connectedCallback() {
//       console.error("connected");
//       this.hidden(true);
      
//       this.querySelector(`[id]`)




//       setTimeout(() => {
//         this.setQuiz({});
//         console.error(this.shadowRoot.querySelector(`#conclusion`));

        

//         this.getElement("#buttonsExercise").onclick = (event) => {
//           let exercise = event.target.getAttribute("slot");

//           this.querySelector(`[id="tower"]`).setAttribute("hidden", "true");
//           this.querySelector("#" + exercise).removeAttribute("hidden");          
//         };
        
//       });
//     }
    
      
   
//     setQuiz() {
//       let chessboard = this.getElement("#board2");
//       chessboard.clear();
//       chessboard.fen = this.getAttribute("fen");
//     }
//   }
// );