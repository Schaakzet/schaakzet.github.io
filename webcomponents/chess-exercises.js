console.log("load <chess-execise");
customElements.define(
  "chess-exercise",
  class extends HTMLElement {
    constructor() {
      super()
        .attachShadow({ mode: "open" })
        .append(
          document.querySelector(`#CHESS-EXERCISE`).content.cloneNode(true)
        );
    }

    getElement(str) {
      return this.shadowRoot.querySelector(str);
    }
    connectedCallback() {
      console.error("connected");
      setTimeout(() => {
        this.setQuiz({});
        this.getElement("#buttons").onclick = (event) => {

            console.error(event.target.getAttribute("slot")); // dit is jouw input

            let letter = "A"; // bepaal de letter
            
            this.querySelector("#"+letter).removeAttribute("hidden");
        };
      });

      
    }

    
    setQuiz() {
      let chessboard = this.getElement("#board2");
      chessboard.clear();
      chessboard.fen = this.getAttribute("fen");
      //this.addClickListeners();
    }
    loadQuizData(quizConfig) {
        console.error("loadQuizData(quizConfig)");
      //Information about the chess piece
      this.getElement("#piece").innerHTML = "De stukken";
      this.getElement("#qPieces").innerHTML = quizConfig.qPieces;
      this.getElement("#explanation").innerHTML = quizConfig.explanation;
      this.getElement("#moveWays").innerHTML = quizConfig.moveWays;

      //Buttons for displaying the right conclusion
      this.getElement("#buttonA").innerHTML = quizConfig.buttonA;
      this.getElement("#buttonB").innerHTML = quizConfig.buttonB;
      this.getElement("#buttonC").innerHTML = quizConfig.buttonC;
      this.getElement("#buttonD").innerHTML = quizConfig.buttonD;
      this.getElement("#buttonE").innerHTML = quizConfig.buttonE;
    }
    addClickListeners() {
      //conclusion clear!
      this.getElement("#conclusion").innerHTML = "";
      //conclusion controle show
      this.getElement("#buttonA").onclick = function () {
        this.getElement("#conclusion").innerHTML = quizConfig.conclusionA;
      };
      this.getElement("#buttonB").onclick = function () {
        this.getElement("#conclusion").innerHTML = quizConfig.conclusionB;
      };
      this.getElement("#buttonC").onclick = function () {
        this.getElement("#conclusion").innerHTML = quizConfig.conclusionC;
      };
      this.getElement("#buttonD").onclick = function () {
        this.getElement("#conclusion").innerHTML = quizConfig.conclusionD;
      };
      this.getElement("#E").onclick = function () {
        this.getElement("#conclusion").innerHTML = quizConfig.conclusionE;
      };
    }
  }
);
