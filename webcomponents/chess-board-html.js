!(function () {
  // ********************************************************** CSS and HTML for <chess-board>
  function squareStateCSS(playerColor) {
    const playerColors = ["lightblue", "lightgreen"];
    //const playerColors = ["transparent", "transparent"];
    const squareColor = playerColor == CHESS.__PLAYER_WHITE__ ? playerColors[0] : playerColors[1];
    const otherPlayer = CHESS.otherPlayer(playerColor);
    const attackedState = CHESS.__ATTACK_PIECE__;
    const selector =
      `chess-board[player="${playerColor}"] ` + // if playerColor
      `chess-square[piece*="${otherPlayer}"]:not([state="${attackedState}"])`; // if piece is not captured
    // disable oponent player squares
    return /*css*/ `${selector} {
          pointer-events:none;
          background: ${squareColor}
        }`;
  }

  const chessboardSTYLES =
    /*html*/ `<style id="chessboard_definition">` +
    squareStateCSS(CHESS.__PLAYER_WHITE__) +
    squareStateCSS(CHESS.__PLAYER_BLACK__) +
    /*css*/ `chess-board {
      --width: 100%;
      width: var(--width);
      height: var(--height);
      max-height:45vw;
      display: inline-block;
      position: relative;
      border: calc(var(--width) / 40) solid gray;
    }` +
    /*css*/ `chess-board:after{content:"";display:block;padding-bottom:100%}` + // make sure chessboard displays as a square
    /* position multiple layers on top of eachother */
    /* width/height is 100% of <chess-board> */
    /* display all elements inside a layer in a 8x8 grid */
    /*css*/ `.chessboard_layer {
      position: absolute;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(8, 1fr);
      grid-template-areas:
      "a8 b8 c8 d8 e8 f8 g8 h8"
      "a7 b7 c7 d7 e7 f7 g7 h7"
      "a6 b6 c6 d6 e6 f6 g6 h6"
      "a5 b5 c5 d5 e5 f5 g5 h5"
      "a4 b4 c4 d4 e4 f4 g4 h4"
      "a3 b3 c3 d3 e3 f3 g3 h3"
      "a2 b2 c2 d2 e2 f2 g2 h2"
      "a1 b1 c1 d1 e1 f1 g1 h1";}` +
    /*html*/ `</style>` +
    /*html*/ `<style>` +
    /*css*/ `#chessboard_pieces{pointer-events:none}` +
    // /*css*/ `.chessboard_layer:empty {display: none}` + //hide empty layers
    /*css*/ `chess-square {overflow:hidden;max-height:100%}` /* keep the square square no matter what is put inside it */ +
    /*css*/ `.black_square {background-color: darkgray}` +
    /*css*/ `.white_square {background-color: white}` +
    /*css*/ `chess-piece {display:inline-block}` +
    /*css*/ `chess-piece > * {width: 100%;position: relative}` +
    /*css*/ `.game_over {pointer-events: none;}` +
    /*html*/ `</style>`;

  const styleHTML = /* function */ (id, css) => /*html*/ `<style id="${id}">${css}</style>`;

  const labelsSTYLE = styleHTML(
    "squarelabels",
    /*css*/ `chess-board[labels] chess-square:after {
          content: attr(at);
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }`
  );
  const disabledBoardSTYLE = styleHTML(
    "disabledboard",
    /*css*/ `chess-board[disabled] chess-square {
      pointer-events:none;
    }`
  );

  window.CHESS.chessboard_innerHTML =
    chessboardSTYLES +
    labelsSTYLE +
    disabledBoardSTYLE +
    /*html*/ `<style id="chessboard_gridareas"></style>` + // inject 64 gridarea definitions here
    /*html*/ `<div id="chessboard_squares" class="chessboard_layer"></div>` + // squares layer
    /*html*/ `<div id="chessboard_pieces" class="chessboard_layer"></div>`;

  //`<style>chess-square:before{content:"d:" attr(defendedby) " a:" attr(attackedby)}</style>`
})();
