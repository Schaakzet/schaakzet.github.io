!(function () {
  // create window.CHESS global Object

  window.CHESS = Object.assign(
    window.CHESS || {}, // create default CHESS object if not exists
    {
      // add constants to CHESS object
      // ********************************************************** LOGGING Levels
      log: {
        BaseClass: { detail: 0, stacktrace: 0 },
        "api-rt": { detail: 0, stacktrace: 0 },
        "chess-board": { detail: 0 },
        "chess-match": { detail: 0 },
        "chess-piece": { detail: 0 },
        "chess-square": { detail: 0 },
        fen: (component, label, value) => {
          console.logColor({ name: "SET FEN", background: "red" }, `${component.localName}.${label}`, value || "START FEN");
        }, // log FEN mutations
      },
      // ********************************************************** HTML CSS
      // TODO: create as attribute and property on <chess-board> so user can select theme colors
      __CLASSNAME_WHITESQUARE__: "white_square",
      __CLASSNAME_BLACKSQUARE__: "black_square",

      // ********************************************************** Web Component Strings
      __WC_CHESS_PIECE__: "chess-piece",
      __WC_CHESS_SQUARE__: "chess-square",
      __WC_CHESS_BOARD__: "chess-board",
      // Web Component attributes
      __WC_ATTRIBUTE_AT__: "at", // <chess-square at="a8" piece="wit-koning">
      __WC_ATTRIBUTE_PIECENAME__: "piece", // <chess-square piece="wit-koning">
      __WC_ATTRIBUTE_IS__: "is", // <chess-piece is="wit-koning">
      __WC_ATTRIBUTE_FEN__: "fen", // FEN notation
      __WC_ATTRIBUTE_RECORD__: "record", // <chess-board record> triggers saving moves to database
      __WC_ATTRIBUTE_PLAYER__: "player", // <chess-board player=" __PLAYER_WHITE__ / __PLAYER_BLACK__ ">
      __WC_ATTRIBUTE_PLAYERTURN__: "playerturn", // <chess-board playerturn=" __PLAYER_WHITE__ / __PLAYER_BLACK__ ">
      __WC_ATTRIBUTE_ATTACKEDBY__: "attackedby", // <chess-square attackedby="Ne3,Qe8">
      __WC_ATTRIBUTE_DEFENDEDBY__: "defendedby", // <chess-square defendedby="Ne3,Qe8">
      __WC_ATTRIBUTE_MOVESFROM__: "movesfrom", // <chess-square movesfrom="Pg2, qh4">

      // ********************************************************** FEN
      __STARTFEN__: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      __FEN_LETTERS__: "RNBQKPrnbqkp",

      // ********************************************************** Eventname constants in all chess files
      __STORECHESSMOVE__: "STORECHESSMOVE", // send to <chess-match>
      __CAPTUREDPIECE__: "CAPTUREDPIECE", // send to progress and show captured piece
      __DO_BOARD_ANALYSIS__: "DO_BOARD_ANALYSIS", // send to <chess-board> to do board analysis
      __CHESSSQUAREUPDATE__: "CHESSSQUAREUPDATE", // send to <chess-board> to update chess square

      // ********************************************************** Chess Game constants
      // chess constants
      __FILES__: "abcdefgh".split(""),
      __RANKS__: "12345678".split(""),

      __PROTECT_PIECE__: "p", // used to highlight the moves a chesspiece can make
      __ATTACK_PIECE__: "x", // used to highlight the moves a chesspiece can make
      __EMPTY_SQUARE__: "e", // used to highlight the moves a chesspiece can make

      __MOVETYPE_MOVE__: "-", // used in move notation
      __MOVETYPE_CAPTURE__: "x", // used in move notation
      __MOVETYPE_ILLEGAL__: "X", // used in move notation

      __PLAYER_WHITE__: "wit", // used as player color AND chesspiece names
      __PLAYER_BLACK__: "zwart", // used as player color AND chesspiece names
      __PIECE_KING__: "koning", // piecenames used as chesspiece filenames
      __PIECE_PAWN__: "pion",
      __PIECE_ROOK__: "toren",
      __PIECE_QUEEN__: "koningin",
      __PIECE_KNIGHT__: "paard",
      __PIECE_BISHOP__: "loper",

      __TESTBOARD_FOR_MOVES__: "testboard",
      __PLAYER_COLOR__: "playercolor",
      __MATCH_GUID__: "match_guid",

      __MOVEPIECE_ANIMATION_DURATION__: 500,

      // ********************************************************** translate moves for all pieces */
      __HORSEMOVES__: [[[2, 1]], [[2, -1]], [[-2, 1]], [[-2, -1]], [[1, 2]], [[1, -2]], [[-1, 2]], [[-1, -2]]],
      __BISHOPMOVES__: [
        [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [5, 5],
          [6, 6],
          [7, 7],
        ],
        [
          [-1, -1],
          [-2, -2],
          [-3, -3],
          [-4, -4],
          [-5, -5],
          [-6, -6],
          [-7, -7],
        ],
        [
          [-1, 1],
          [-2, 2],
          [-3, 3],
          [-4, 4],
          [-5, 5],
          [-6, 6],
          [-7, 7],
        ],
        [
          [1, -1],
          [2, -2],
          [3, -3],
          [4, -4],
          [5, -5],
          [6, -6],
          [7, -7],
        ],
      ],
      __ROOKMOVES__: [
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
          [0, 6],
          [0, 7],
        ],
        [
          [1, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
          [6, 0],
          [7, 0],
        ],
        [
          [0, -1],
          [0, -2],
          [0, -3],
          [0, -4],
          [0, -5],
          [0, -6],
          [0, -7],
        ],
        [
          [-1, 0],
          [-2, 0],
          [-3, 0],
          [-4, 0],
          [-5, 0],
          [-6, 0],
          [-7, 0],
        ],
      ],
      __KINGMOVES__: [[[0, 1]], [[1, 1]], [[1, 0]], [[1, -1]], [[0, -1]], [[-1, -1]], [[-1, 0]], [[-1, 1]]],
    }
  );

  // add constants based on above constants
  Object.assign(CHESS, {
    __PIECE_WHITE_PAWN__: CHESS.__PLAYER_WHITE__ + "-" + CHESS.__PIECE_PAWN__,
    __PIECE_BLACK_PAWN__: CHESS.__PLAYER_BLACK__ + "-" + CHESS.__PIECE_PAWN__,

    __PLAYER_COLORS__: [CHESS.__PLAYER_WHITE__, CHESS.__PLAYER_BLACK__],
    __PIECE_NAMES__: [CHESS.__PIECE_ROOK__, CHESS.__PIECE_KNIGHT__, CHESS.__PIECE_BISHOP__, CHESS.__PIECE_QUEEN__, CHESS.__PIECE_KING__, CHESS.__PIECE_PAWN__],
    __QUEENMOVES__: [...CHESS.__BISHOPMOVES__, ...CHESS.__ROOKMOVES__],
  });

  // add functions
  // ********************************************************** Helper functions
  Object.assign(CHESS, {
    otherPlayer: (color) => (color == CHESS.__PLAYER_WHITE__ ? CHESS.__PLAYER_BLACK__ : CHESS.__PLAYER_WHITE__),

    // ======================================================== CHESS.createBoardElement
    createBoardElement: ({
      tag = CHESS.__WC_CHESS_BOARD__, // <chess-board>
      props = {},
      attrs = [],
    }) => {
      const chessboard = document.createElement(tag);
      chessboard.id = props.id;
      //! WE PROBABLY CAN'T SET FEN HERE, BECAUSE IT IS NOT IN THE DOM
      attrs.map(([name, value]) => chessboard.setAttribute(name, value));
      return chessboard;
    },
  });

  // ********************************************************** CHESS Analysis constants
  Object.assign(CHESS, {
    __ANALYSIS_PRE__: "pre_analysis",
    __ANALYSIS_AFTER__: "after_analysis",
  });

  // ********************************************************** Square functions
  const translateSquare = (square, file_offset, rank_offset) => {
    // TODO: ("b2", 1, 1) -> "c3"
    // TODO: ("b2", -1, -1) -> "a1"
  };

  // ********************************************************** FEN functions
  // create a lookup Map ONCE to lookup BOTH letters OR piecename
  // "R" -> "wit-toren"
  // "wit-toren" -> "R"
  let FENMap = new Map(); // see MDN Map documentation
  let FENletters = CHESS.__FEN_LETTERS__.split(""); // create an array of letters
  CHESS.__PLAYER_COLORS__.forEach((color) =>
    CHESS.__PIECE_NAMES__.forEach((name) => {
      const piece = color + "-" + name;
      const letter = FENletters.shift(); // remove first letter from array
      FENMap.set(piece, letter);
      FENMap.set(letter, piece);
    })
  );
  Object.assign(CHESS, {
    convertFEN: (name) => FENMap.get(name), // return R or wit-toren
  });
})(); // end of IIFE
