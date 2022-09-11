customElements.define(
  "chess-match-buttons",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      super.connectedCallback();
      this.style = "display: block; padding-bottom: 18px";
      this.innerHTML =
        `<create-html>` +
        `a|index.html|schaakzet\n` +
        `button|seats.html|Seats\n` +
        `|Play:\n` +
        `button|chess-match:removeMatch|Quit Match\n` +
        `button|chess-match:newMatch|New Match\n` +
        // `button|chess-match:removeMatch|removeMatch\n` +
        // `button|chess-match:myFEN|My FEN\n` +
        // `button|chess-match:forceBlackPlayer|Force Black\n` +
        `button|chess-board:turnBoard|TURN BOARD\n` +
        `button|chess-board:changePlayer|Change Player\n` +
        `button|chess-board:changePlayerTurn|Change Player Turn\n` +
        `button|chess-match:undoLastMove|undo move\n` +
        //`button|chess-match:remise|remise\n` +
        //`button|chess-match:fullScreen|Full Screen\n` +
        `button|chess-match:mockMove|test Move\n` +
        `</create-html>`;
    }
  }
);
