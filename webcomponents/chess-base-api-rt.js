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
  callAPI(
    operation,
    body, // FormData
    callback = () => console.error("No callback function")
  ) {
    function log(...args) {
      console.log(`%c DB ${args.shift()}`, "background:gold", ...args);
    }
    body.operation = operation;
    body.table = "matches";
    log(operation, body);
    fetch(CHESS.APIRT.__API_MATCHES__, {
      method: "POST",
      headers: CHESS.APIRT.__API_HEADERS__,
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((json_response) => {
        log("json response", json_response.dev);
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
    CHESS.APIRT.callAPI(
      "insert",
      {
        "data[player_white]": player_white,
        "data[player_black]": player_black,
      },
      callback
    );
  },
  // ================================================== updateMatch
  updateMatch({
    id, // match GUID
    player_white = "", // player white name
    player_black = "", // player black name
    callback,
  }) {
    CHESS.APIRT.callAPI(
      "update",
      {
        id,
        "data[player_white]": player_white,
        "data[player_black]": player_black,
      },
      callback
    );
  },
  // ================================================== resumeMatch
  resumeMatch({
    id, // match GUID
    callback,
  }) {
    CHESS.APIRT.callAPI("fetch", { id }, callback);
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
    let body = new FormData(); // todo
    body.append("id", id);
    body.append("data[move]", move);
    body.append("data[fromsquare]", fromsquare);
    body.append("data[tosquare]", tosquare);
    body.append("data[fen]", fen);
    CHESS.APIRT.callAPI("insert", body, callback);
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
