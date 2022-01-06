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
      setTimeout(() => this.setQuiz({}));
    }
    setQuiz() {
      let chessboard = this.getElement("#board2");
      chessboard.clear();
      chessboard.fen = this.getAttribute("fen");
      this.addClickListeners();
    }
    loadQuizData(quizConfig) {
      //Information about the chess piece
      this.getElement("#piece").innerHTML = "De stukken";
      this.getElement("#stenen").innerHTML = quizConfig.stenen;
      this.getElement("#uitleg").innerHTML = quizConfig.uitleg;
      this.getElement("#zetten").innerHTML = quizConfig.zetten;
      this.getElement("#opdracht").innerHTML =
        "Denk eventjes over de verschillende mogelijke zetten na. Is de zet mogelijk? Of waarom juist niet? Is de zet sinnvoll?";
      //Buttons for displaying the right conclusion
      this.getElement("#A").innerHTML = quizConfig.buttonA;
      this.getElement("#B").innerHTML = quizConfig.buttonB;
      this.getElement("#C").innerHTML = quizConfig.buttonC;
      this.getElement("#D").innerHTML = quizConfig.buttonD;
      this.getElement("#E").innerHTML = quizConfig.buttonE;
    }
    addClickListeners() {
      //conclusion clear!
      this.getElement("#e").innerHTML = "";
      //conclusion controle show
      this.getElement("#A").onclick = function () {
        this.getElement("#e").innerHTML = quizConfig.conclusionA;
      };
      this.getElement("#B").onclick = function () {
        this.getElement("#e").innerHTML = quizConfig.conclusionB;
      };
      this.getElement("#C").onclick = function () {
        this.getElement("#e").innerHTML = quizConfig.conclusionC;
      };
      this.getElement("#D").onclick = function () {
        this.getElement("#e").innerHTML = quizConfig.conclusionD;
      };
      this.getElement("#E").onclick = function () {
        this.getElement("#e").innerHTML = quizConfig.conclusionE;
      };
    }
  }
);
