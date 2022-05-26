Object.assign(CHESS, {
  __API_RECORDS__: "https://schaakzet.nl/api/crud/index.php/records/",
  __API_SCHAAKZET__: "https://schaakzet.nl/api/rt/index.php/?action=",
  __API_MATCHES__: "https://schaakzet.nl/api/rt/matches.php",
  __API_MATCHMOVES__: "https://schaakzet.nl/api/rt/matchmoves.php", // CHESS.__API_MATCHMOVES__
  __API_MATCMOVES_EVENTSOURCE__: "https://schaakzet.nl/api/rt/matchmoves_eventsource.php",
  __API_TABLE_MATCHMOVES__: "matchmoves",
  __API_HEADERS__: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  // ================================================== deleteMatchByGUID
  deleteMatchByGUID: (guid) => {
    fetch(CHESS.__API_SCHAAKZET__ + `delete&matchid=` + guid, {
      method: "GET",
      headers: CHESS.__API_HEADERS__,
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
    body.function = operation;
    body.table = "matches";
    log(operation, body);
    fetch(CHESS.__API_MATCHES__, {
      method: "POST",
      body,
    })
      .then((response) => {
        log("response", response);
        if (response.json) response = response.json();
        else response = response.text();
        return response;
      })
      .then((match_id) => {
        log("match_id", match_id);
        callback(match_id);
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
    CHESS.callAPI(
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
    CHESS.callAPI(
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
    CHESS.callAPI("fetch", { id }, callback);
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
    CHESS.callAPI("insert", body, callback);
  },
  // ================================================== undoChessMove
  undoChessMove({ id, callback }) {
    let body = new FormData(); // todo
    body.append("id", this.match_id);
    CHESS.callAPI("delete", body, callback);
  },

  // ================================================== deleteStartboard
  deleteStartboards({ callback }) {
    CHESS.callAPI("deleteStartboards", {}, callback);
  },
});
