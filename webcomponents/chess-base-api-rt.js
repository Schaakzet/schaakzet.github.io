CHESS.APIRT = CHESS.APIRT || {};

// add constants
Object.assign(CHESS.APIRT, {
  __API_RECORDS__: "//schaakzet.nl/api/crud/index.php/records/",
  __API_SCHAAKZET__: "//schaakzet.nl/api/rt/index.php/?action=",
  __API_MATCHES__: "//schaakzet.nl/api/chessgame.php",
  __API_MATCHMOVES__: "//schaakzet.nl/api/rt/matchmoves.php", // CHESS.__API_MATCHMOVES__
  __API_MATCHMOVES_EVENTSOURCE__: "//schaakzet.nl/api/rt/matchmoves_eventsource.php",
  __API_TABLE_MATCHMOVES__: "matchmoves",
  __API_HEADERS__: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  // ================================================== deleteMatchByGUID
  deleteMatchByGUID: (guid) => {
    fetch(CHESS.__API_SCHAAKZET__ + `delete&matchid=` + guid, {
      method: "GET",
      headers: CHESS.APIRT.__API_HEADERS__,
    });
  },
  // ================================================== callAPI
  callAPI({
    action,
    body = {}, // JSON
    method = "GET",
    callback = () => console.error("No callback function"),
  }) {
    function log(...args) {
      console.log(`%c DB ${args.shift()}`, "background:gold", ...args);
    }
    body.action = action;
    // -------------------------------------------------- build options
    let options = {
      method,
      //mode: "no-cors",
      headers: CHESS.APIRT.__API_HEADERS__,
      body: JSON.stringify(body),
    };
    // -------------------------------------------------- build URI
    let uri = CHESS.APIRT.__API_MATCHES__ + "?c=" + new Date() / 1;
    if (method == "GET") {
      uri += "&action=" + body.action;

      //! chessboard.id == match_guid in database
      if (body.match_guid) uri += "&match_guid=" + body.match_guid;
      else if (body.id) uri += "&match_guid=" + body.id;

      if (body.where) uri += "&where=" + body.where;
      if (body.wp_user_white) uri += "&wp_user_white=" + body.wp_user_white;
      if (body.player_white) uri += "&player_white=" + body.player_white;
      if (body.wp_user_black) uri += "&wp_user_black=" + body.wp_user_black;
      if (body.player_black) uri += "&player_black=" + body.player_black;
      if (body.move) uri += "&move=" + body.move;
      if (body.fen) uri += "&fen=" + body.fen;

      delete options.body;
    }
    log("callAPI", { action, uri, body });
    // -------------------------------------------------- fetch
    fetch(uri, options)
      .then((response) => response.json())
      .then((json_response) => {
        log("json response", json_response.rows.length, "rows:", { rows: json_response.rows }, "\nDEV:", json_response.development_info);
        callback(json_response);
      })
      .catch((e, r) => {
        console.error("%c No JSON response!", "background:red;color:white", e);
      });
  },

  // ================================================== createMatch
  createMatch({
    player_white = "", // player white name
    player_black = "", // player black name
    callback,
  }) {
    CHESS.APIRT.callAPI({
      action: "CREATE",
      body: {
        player_white: player_white,
        player_black: player_black,
      },
      callback,
    });
  },

  // ================================================== undoChessMove
  undoChessMove({ id, callback }) {
    let body = { id: this.match_guid };
    CHESS.APIRT.callAPI("delete", body, callback);
  },

  // ================================================== deleteStartboard
  deleteStartboards({ callback }) {
    CHESS.APIRT.callAPI("deleteStartboards", {}, callback);
  },
});
