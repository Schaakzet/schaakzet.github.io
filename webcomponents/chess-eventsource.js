!(function () {
  // custom log colors for this file
  const __COMPONENT_NAME__ = "EventSource";
  // ********************************************************** logging
  // the amount of console.logs displayed in this component
  let logDetailComponent = 4; //! -1=no logs 0=use global setting >0=custom setting
  let logComponent = window.CHESS.log[__COMPONENT_NAME__];
  let logDetail = logDetailComponent || logComponent.detail;

  function log() {
    console.logColor &&
      console.logColor(
        {
          name: __COMPONENT_NAME__,
          background: "cornflowerblue",
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
      let { chessboard } = root;
      chessboard.evtCounter = 0;
      // subscribe to a server Event Source,
      // it sends an update for every made matchmove recorded in the database
      const API = CHESS.APIRT.__API_MATCHMOVES_EVENTSOURCE__;
      log("initialized", API);
      try {
        const evtSource = new EventSource(API);
        evtSource.onopen = () => {
          chessboard.evtCounter++;
          if (this.EVERROR) {
            console.warn("%c EventSource forced reload", "background:red;color:white", chessboard.evtCounter);
            // this.updateProgressFromDatabase({ match_guid: localStorage.getItem(CHESS.__MATCH_GUID__) });
          }
          this.EVERROR = false;
        };
        evtSource.onerror = (evt) => {
          this.EVERROR = true;
          console.warn("%c EventSource error", "background:red;color:white", evt);
        };
        evtSource.onmessage = (evt) => {
          if (evt.data) {
            log("Received", evt.data);
            const receivedData = JSON.parse(evt.data); //! TODO this can be data for multiple matches!
            let { fen, match_guid, move } = receivedData;
            if (chessboard.evtCounter == 1)
              root.dispatch({
                name: match_guid, // eventListener is in <chess-board>.listenOnMatchID
                detail: {
                  match_guid,
                  fen,
                  move,
                },
              });
          } else {
            log("EventSource Reset, with", evt);
          }
        };
      } catch (e) {
        console.error("Event Source error", API);
      }
    }, // initialize
  });// Object.assign(CHESS.EVENTSOURCE, {
})(); // end IIFE
