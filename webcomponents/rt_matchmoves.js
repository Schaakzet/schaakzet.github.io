!(function () {
  // TABLE matchmoves
  //    matchmoves_id      - PRIMARY KEY   - set by bodybase
  //    fen                - VARCHAR(64)   - FEN string of the chessboard, default set by bodybase
  //    fromSquare         - VARCHAR(64)
  //    toSquare           - VARCHAR(64)
  //    move

  // API functions:
  //    create({ fen, fromSquare, toSquare });
  //    read({ matchmoves_id });
  //    delete({ matchmoves_id });

  const __RT_API__ = "https://schaakzet.nl/api/rt/matchmoves.php";

  // ======================================================== CREATE/ INSERT

  const body = new FormData();
  body.append("function", "insert");
  body.append("id", "97B8D3E8-9DF9-49A1-A375-CF2F48BC8D36");
  body.append("data[move]", "a1xf8");
  body.append("data[fromsquare]", "e2");
  body.append("data[tosquare]", "e4");
  body.append("data[fen]", "1r/3tr3/ad/8/8/8/5kK2/pppppppp");

  $RT_API({ method: "POST", body }),
    // ********************************************************** $CRUD_API
    function $RT_API({
      method = "POST",
      body = {},
      callback = () => {}, // default empty callback function
    }) {
      // ======================================================== clean {} body
      let matchmoves_id = body.matchmoves_id; // get match_id
      delete body.matchmoves_id;
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
      if (method == "POST") delete options.body;
      // ======================================================== create uri
      let uri = __RT_API__;
      if (id) uri += "/" + id;
      if (uri_filter) uri += (uri_filter[0] == "?" ? "" : "?") + uri_filter; // ensure ? at the beginning of the filter
      //console.log(uri);
      // ======================================================== fetch
      fetch(uri, options)
        .then((response) => response.json())
        .then((response) => {
          // ======================================================== execute callback function
          if (response.records) callbackFunc(response.records);
          else callbackFunc(response);
        });
    }; // $RT_API
})(); // IIFE
