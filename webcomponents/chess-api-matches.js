!(function () {
  // TABLE MATCHES
  //    match_id       - PRIMARY KEY   - set by database
  //    wp_user_white  - INT           - user id in the wp_user WordPress table
  //    wp_user_black  - INT           - user id in the wp_user WordPress table
  //    player_white   - VARCHAR(64)   - name of the player
  //    player_black   - VARCHAR(64)   - name of the player
  //    starttime      - TIMESTAMP     - when the match started - default set by database
  //    endtime        - TIMESTAMP     - when the match ended - default NULL set by database
  //    fen            - VARCHAR(64)   - FEN string of the chessboard, default set by database
  //    result         - VARCHAR(64)   - match result, default "" set by database
  
  // API functions:
  //    create({ player_white, player_black });
  //    read({ match_id });
  //    update({ match_id, [...] });
  //    delete({ match_id });
  
  const __CRUDAPI__ = "https:/schaakzet.nl/api/crud/index.php/records/";
  const __TABLE_NAME__ = "matches";
  const __FILTER_AVAILABLE_BOARDS__ = "?filter1=player_white,eq,&filter2=player_black,eq,"
  
  // **********************************************************
  // stick all API interactions on the global object
  window.CHESS.API = window.CHESS.API || {
    [__TABLE_NAME__]: {},
  };
  // ********************************************************** $CRUD_API
  function $CRUD_API({
    table = __TABLE_NAME__, // default table name
    filter = false, // default no filter
    method = "GET",
    body = {},
    callback = () => {}, // default empty callback function
  }) {
    // ======================================================== clean {} body
    let match_id = body.match_id; // get match_id
    delete body.match_id;
    let callbackFunc = body.callback || callback || (() => {}); // default empty callback function
    delete body.callback;
    let uri_filter = filter || body.filter || false; // default no filter
    delete body.filter;
    // ======================================================== create options {}
    let options = {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
    if (method == "GET") delete options.body;
    // ======================================================== create uri
    let uri = __CRUDAPI__ + table;
    if (match_id) uri += "/" + match_id;
    if (uri_filter) uri += (uri_filter[0] == "?" ? "" : "?") + uri_filter; // ensure ? at the beginning of the filter
    console.log(uri);
    // ======================================================== fetch
    fetch(uri, options)
      .then((response) => response.json())
      .then((response) => {
        // ======================================================== execute callback function
        if (response.records) callbackFunc(response.records);
        else callbackFunc(response);
      });
  } // $CRUD_API

  // ********************************************************** TableAPI: matches
  let $TABLEAPI = Object.assign(window.CHESS.API[__TABLE_NAME__], {
    // ======================================================== CREATE
    create: (
      body = ({
        player_white = "", // default
        player_black = "", // default
      } = {})
    ) => $CRUD_API({ method: "POST", body }),
    // ======================================================== READ
    read: (body = {}) => $CRUD_API({ method: "GET", body }),
    // ======================================================== UPDATE
    update: (body = {}) => $CRUD_API({ method: "PUT", body }),
    // ======================================================== DELETE
    delete: (body = {}) => $CRUD_API({ method: "DELETE", body }),
    // ======================================================== truncate
    // TODO: implement
    // ======================================================== updateFEN
    updateFEN({ match_id, fen }) {
      $TABLEAPI.update({ match_id, fen });
    },
    // ======================================================== availableBoards
    availableBoards(body = {}) {
      let filter = body.filter || __FILTER_AVAILABLE_BOARDS__;
      $TABLEAPI.read({
        filter,
        callback: (response) => {
          console.group("availableBoards", filter);
          response.forEach((match) => console.warn(match));
          console.groupEnd();
        },
        ...body,
      });
    },
  }); // Object.assign API functions

  function testAPI() {
    $TABLEAPI.create({
      player_white: "witter",
      callback: (match_id) => {
        console.log("match_id", match_id);
        $TABLEAPI.update({
          match_id, //
          player_white: "WIT",
          player_black: "",
          callback: (response) => {
            console.log("update response", response);
            $TABLEAPI.read({
              match_id,
              callback: (response) => {
                console.log("read response", response);
                $TABLEAPI.delete({
                  match_id,
                  callback: (response) => {
                    console.log("delete response", response);
                    $TABLEAPI.availableBoards({
                      callback1: (response) => {
                        console.log("availableBoards response", response);
                      },
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
  } // testAPI()
  //testAPI();
})(); // IIFE
