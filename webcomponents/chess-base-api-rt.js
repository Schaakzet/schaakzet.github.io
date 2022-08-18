window.CHESS.APIRT = window.CHESS.APIRT || {};

// add constants
Object.assign(window.CHESS.APIRT, {
  __API_RECORDS__: "//schaakzet.nl/api/crud/index.php/records/",
  __API_SCHAAKZET__: "//schaakzet.nl/api/chessgame.php/?action=",
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
    fetch(window.CHESS.APIRT.__API_SCHAAKZET__ + "DELETEMATCH" + "&match_guid=" + guid, {
      method: "GET",
      headers: window.CHESS.APIRT.__API_HEADERS__,
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
      let label = args.shift();
      let color = label.includes("fetched") ? "green" : "red";
      console.log(`%c ${label} `, `background:gold;color:${color}`, ...args);
    }
    body.action = action;
    // -------------------------------------------------- build options
    let options = {
      method,
      //mode: "no-cors",
      headers: window.CHESS.APIRT.__API_HEADERS__,
      body: JSON.stringify(body),
    };
    // -------------------------------------------------- build URI
    let uri = window.CHESS.APIRT.__API_MATCHES__ + "?c=" + new Date() / 1;
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
    log(`action=${action}`, body.where || body.id || body);
    // -------------------------------------------------- fetch
    fetch(uri, options)
      .then((response) => response.json())
      .then((json_response) => {
        let rowcount = json_response.rows.length;
        if (rowcount == 1) {
          log(`fetched ${body.action} ${body.where || ""}:`, { ROW: json_response.rows[0] });
        } else {
          log(`fetched ${body.action} ${body.where || ""} ${rowcount} rows:`, json_response);
        }
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
    window.CHESS.APIRT.callAPI({
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
    window.CHESS.APIRT.callAPI("delete", body, callback);
  },

  // ================================================== deleteStartboard
  deleteStartboards({ callback }) {
    window.CHESS.APIRT.callAPI("deleteStartboards", {}, callback);
  },
});
