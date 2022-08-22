!(function () {
  /*
  adds GLOBAL code to GLOBAL CHESS.APIRT Object (API Roads Technology)
  having it on APIRT makes it easier to (one time) switch to other API endpoints

  CHESS.APIRT.constants
  CHESS.APIRT.functions
  deleteMatchByGuid
  callAPI
  createMatch
  undoChessMove //! unused?
  deleteStartboards //! unused?
  */
  const __API__ = "//schaakzet.nl/api/";
  const __API_CHESSGAME__ = "chessgame.php";
  const __API_RT_DIRECTORY__ = "rt/";
  const __API_MATCHMOVES__ = "matchmoves.php";
  const __API_MATCHMOVES_EVENTSOURCE__ = "matchmoves_eventsource.php";
  const __API_TABLE_MATCHMOVES__ = "matchmoves";

  // custom log colors for this file
  const __COMPONENT_NAME__ = "api-rt";
  // ********************************************************** logging

  // the amount of console.logs displayed in this component
  let logDetailComponent = 0; //! -1=no logs 0=use global setting >0=custom setting
  let logComponent = window.CHESS.log[__COMPONENT_NAME__];
  let logDetail = logDetailComponent || logComponent.detail;

  function log() {
    console.logColor &&
      console.logColor(
        {
          name: __COMPONENT_NAME__,
          background: "orangered",
          ...logComponent,
        },
        ...arguments
      );
  }

  // ********************************************************** CHESS.APIRT
  CHESS.APIRT = CHESS.APIRT || {};

  // add CHESS.APIRT.constants
  Object.assign(CHESS.APIRT, {
    __API_RECORDS__: __API__ + "crud/index.php/records/", //! old CRUD API, before Bart created our own
    __API_SCHAAKZET__: __API__ + __API_CHESSGAME__ + "/?action=",
    __API_MATCHES__: __API__ + __API_CHESSGAME__,
    __API_MATCHMOVES__: __API__ + __API_RT_DIRECTORY__ + __API_MATCHMOVES__, // CHESS.__API_MATCHMOVES__
    __API_MATCHMOVES_EVENTSOURCE__: __API__ + __API_RT_DIRECTORY__ + __API_MATCHMOVES_EVENTSOURCE__,
    __API_TABLE_MATCHMOVES__: __API_TABLE_MATCHMOVES__, //! looks likes this is not used any more
    __API_HEADERS__: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    // add CHESS.APIRT.functions
    // ================================================== deleteMatchByGUID
    deleteMatchByGUID: (guid) => {
      fetch(CHESS.APIRT.__API_SCHAAKZET__ + "DELETEMATCH" + "&match_guid=" + guid, {
        method: "GET",
        headers: CHESS.APIRT.__API_HEADERS__,
      });
      return;
      //! todo: replace with proper API call
      CHESS.APIRT.callAPI({
        action: "DELETEMATCH",
        body: {
          match_guid: guid,
        },
      });
    },
    // ================================================== callAPI
    callAPI({
      action,
      body = {}, // JSON
      method = "GET",
      callback = () => console.error("APIRT.callAPI(): No callback function define"),
    }) {
      body.action = action;
      // -------------------------------------------------- build options
      let options = {
        method,
        //mode: "no-cors",
        headers: CHESS.APIRT.__API_HEADERS__,
        body: JSON.stringify(body),
      };
      // -------------------------------------------------- build URI
      let uri = CHESS.APIRT.__API_MATCHES__ + "?c=" + new Date() / 1; // with cache buster in URI
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
      if (logDetail > 0) log(`action=${action}`, body.where || body.id || body);
      // -------------------------------------------------- fetch
      fetch(uri, options)
        .then((response) => response.json())
        .then((json_response) => {
          if (logDetail > 1) log("JSON Response:", json_response);
          let rowcount = json_response.rows.length;
          if (rowcount == 1) {
            if (logDetail > 1) log(`fetched ${body.action} ${body.where || ""}:`, { ROW: json_response.rows[0] });
          } else {
            if (logDetail > 1) log(`fetched ${body.action} ${body.where || ""} ${rowcount} rows:`, json_response);
          }
          //!! execute callback function
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
          player_white,
          player_black,
        },
        callback,
      });
    },

    // ================================================== undoChessMove
    undoChessMove({ id, callback }) {
      let body = { id: this.match_guid };
      //! unused?? because callAPI has the old multi parameter syntax, not an Object
      CHESS.APIRT.callAPI("delete", body, callback);
    },

    // ================================================== deleteStartboard
    deleteStartboards({ callback }) {
      //! unused?? because callAPI has the old multi parameter syntax, not an Object
      CHESS.APIRT.callAPI("deleteStartboards", {}, callback);
    },
  }); // end CHESS.APIRT object
})(); // end IIFE
