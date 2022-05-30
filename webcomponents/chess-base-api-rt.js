CHESS.APIRT = CHESS.APIRT || {};

// add constants
Object.assign(CHESS.APIRT, {
  __API_RECORDS__: "//schaakzet.nl/api/crud/index.php/records/",
  __API_SCHAAKZET__: "//schaakzet.nl/api/rt/index.php/?action=",
  __API_MATCHES__: "//schaakzet.nl/api/rt/matches.php",
  __API_MATCHMOVES__: "//schaakzet.nl/api/rt/matchmoves.php", // CHESS.__API_MATCHMOVES__
  __API_MATCMOVES_EVENTSOURCE__: "//schaakzet.nl/api/rt/matchmoves_eventsource.php",
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
    operation,
    body, // FormData
    method = "POST",
    callback = () => console.error("No callback function"),
  }) {
    function log(...args) {
      console.log(`%c DB ${args.shift()}`, "background:gold", ...args);
    }
    body.operation = operation;
    body.table = "matches";
    let uri = CHESS.APIRT.__API_MATCHES__;
    let options = {
      method,
      //mode: "no-cors",
      headers: CHESS.APIRT.__API_HEADERS__,
      body: JSON.stringify(body),
    };
    method = "GET";
    if (method == "GET") {
      uri += "?operation=" + body.operation;
      uri += "&guid=" + body.id;
      delete options.body;
    }
    log(operation, uri, body);
    fetch(uri, options)
      .then((response) => response.json())
      .then((json_response) => {
        log("json response", json_response.rows.length, "rows:", { rows: json_response.rows }, "\nDEV:", json_response.dev);
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
      operation: "CREATE",
      body: {
        player_white: player_white,
        player_black: player_black,
      },
      callback,
    });
  },
  // ================================================== updateMatch
  updateMatch({
    id, // match GUID
    player_white = "", // player white name
    player_black = "", // player black name
    callback,
  }) {
    CHESS.APIRT.callAPI({
      operation: "UPDATE",
      body: {
        id,
        "data[player_white]": player_white,
        "data[player_black]": player_black,
      },
      callback,
    });
  },
  // ================================================== storeChessMove
  storeChessMove({
    id, // GUID
    move,
    fromsquare,
    tosquare,
    fen,
    callback,
  }) {
    CHESS.APIRT.callAPI(
      "RECORDCHESSMOVE",
      {
        match_id:id,
        move,
        fromsquare,
        tosquare,
        fen,
      },
      callback
    );
  },
  // ================================================== undoChessMove
  undoChessMove({ id, callback }) {
    let body = new FormData(); // todo
    body.append("id", this.match_id);
    CHESS.APIRT.callAPI("delete", body, callback);
  },

  // ================================================== deleteStartboard
  deleteStartboards({ callback }) {
    CHESS.APIRT.callAPI("deleteStartboards", {}, callback);
  },
});
