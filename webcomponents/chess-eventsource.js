!(function () {
  // custom log colors for this file
  const __COMPONENT_NAME__ = "EventSource";
  // ********************************************************** logging
  // the amount of console.logs displayed in this component
  let logDetailComponent = 1; //! -1=no logs 0=use global setting >0=custom setting
  let logComponent = window.CHESS.log[__COMPONENT_NAME__];
  let logDetail = logDetailComponent || logComponent.detail;

  function log() {
    console.logColor &&
      console.logColor(
        {
          name: __COMPONENT_NAME__,
          background: "darkorange",
          color: "black",
          ...logComponent,
        },
        ...arguments
      );
  }
  // ********************************************************** logging
  CHESS.EVENTSOURCE = CHESS.EVENTSOURCE || {};
  Object.assign(CHESS.EVENTSOURCE, {
    initialize: ({ root }) => {
      //! 'this' scope is window!!!!
      let { chessboard } = root;
      // subscribe to a server Event Source,
      // it sends an update for every made matchmove recorded in the database
      const API = CHESS.APIRT.__API_MATCHMOVES_EVENTSOURCE__;
      log("initialized", API);
      console.time("EVENTSOURCE");
      try {
        const evtSource = new EventSource(API);
        evtSource.onopen = () => {
          log("open", API);
        };
        evtSource.onerror = (evt) => {
          log(`%c onerror`, "background:red;color:white");
          console.timeEnd("EVENTSOURCE");
          //evtSource.close();
          //CHESS.EVENTSOURCE.initialize({ root });
        };
        evtSource.onmessage = (evt) => {
          console.error("Would like to restart board here");
          let forcedRestart_instead_of_build_board_step_by_step = false;
          if (forcedRestart_instead_of_build_board_step_by_step) {
            let { match_guid } = evt.data;
            chessboard.closest("chess-game").restartMatch(match_guid);
          } else {
            if (evt.data) {
              CHESS.EVENTSOURCE.dispatchMove(
                chessboard,
                JSON.parse(evt.data) //! from database: {match_guid, move, fen}
              );
            } else {
              log("EventSource Reset, with", evt);
            }
          }
        };
      } catch (e) {
        console.error("Event Source error", API);
      }
    }, // initialize
    dispatchMove(
      chessboard, // pass as parameter so we can use this method to mock moves for testing
      { match_guid, move, fen }
    ) {
      log(`Received move: %c ${move}`, "background:red;color:white;font-size:120%", fen);
      chessboard.dispatch_GUID({ fen, move });
    },
  }); // Object.assign(CHESS.EVENTSOURCE, {
})(); // end IIFE
