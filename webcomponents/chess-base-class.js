!(function () {
  /* BaseClass for <chess-board>,<chess-square>,<chess-piece>

  class:ChessBaseElement
    -► class:ChessBaseSquarePieceElement
      -► component:<chess-square>
      -► component:<chess-piece>
      -► component:<chess-board>
  */

  // ********************************************************** ChessBaseElement
  // one BaseClass for all to be created Custom Elements/Web Components
  CHESS.ChessBaseElement = class extends HTMLElement {
    // ======================================================== constructor
    // constructor() {
    //   super(); //! empty constructor with only super() not required
    // }
    // ======================================================== connectedCallback
    connectedCallback() {
      // ------------------------------------------------------- listen to <x-y> events
      document.addEventListener(this.localName, (evt) => {
        let { value } = evt.detail;
        //!! if a method on this DOM element exists, execute "createMatch"
        if (this[value]) this[value](evt); // call method
      });
    }
    // ======================================================== BaseElement.docs
    // List methods and properties of a Component in the console
    docs(obj) {
      if (obj) {
        let proto = Reflect.getPrototypeOf(obj);
        let methods = [];
        let props = [];
        function log(name, arr) {
          arr = arr.filter((x) => x != "constructor");
          console.warn(`%c ${obj.nodeName} ${name}:`, "background:gold", arr.join(", "));
        }
        Reflect.ownKeys(proto).forEach((key) => {
          try {
            if (typeof proto[key] == "function") methods.push(key);
          } catch (e) {
            props.push(key);
          }
        });
        log("methods", methods);
        log("properties", props);
      }
    }
    // ======================================================== BaseElement.dispatch
    // dispatch CustomEvent from this element
    dispatch({
      root = this, // default dispatch from current this element or use something like root:document
      name, // EventName
      detail = {}, // event.detail
      // override options PER option:
      bubbles = true, // default, bubbles up the DOM
      composed = true, // default, escape shadowRoots
      cancelable = true, // default, cancelable event bubbling
      // options PER event:
      options = {
        bubbles,
        composed,
        cancelable,
      },
    }) {
      // console.warn("%c EventName:", "background:yellow", name, [detail]);
      root.dispatchEvent(
        new CustomEvent(name, {
          ...options, //
          detail,
        })
      );
    }
    // ======================================================== BaseElement.listen2matchmoves
    listen2matchmoves(
      root = this // disppatch matchid name event from this root (this = default)
    ) {
      const logDetail = 2;
      const __COMPONENT_NAME__ = "listen2matchmoves";
      function log() {
        console.logColor &&
          console.logColor(
            {
              name: __COMPONENT_NAME__,
              background: "blue",
            },
            ...arguments
          );
      }

      //! oh boy Sandro introduces global variables
      window.evtCounter = 0;

      // subscribe to a server Event Source,
      // it sends an update for every made matchmove recorded in the database
      const API = CHESS.APIRT.__API_MATCHMOVES_EVENTSOURCE__;
      log("init", API);

      try {
        const evtSource = new EventSource(API);
        evtSource.onopen = () => {
          if (this.EVERROR) {
            console.warn("%c EventSource forced reload", "background:red;color:white");
            // this.updateProgressFromDatabase({ match_guid: localStorage.getItem(CHESS.__MATCH_GUID__) });
          }
          this.EVERROR = false;
          window.evtCounter++;
          if (logDetail > 1) log("window.evtCounter:", window.evtCounter);
        };
        evtSource.onerror = (evt) => {
          this.EVERROR = true;
          //console.warn("%c EventSource error", "background:red;color:white", evt);
        };
        evtSource.onmessage = (evt) => {
          // respond to the Event
          if (evt.data) {
            // console.clear();
            log("Received", evt.data);
            const receivedData = JSON.parse(evt.data); //! TODO this can be data for multiple matches!
            let { fen, match_guid, move } = receivedData;

            // function findToSquareInFEN(toSquare, fen) {
            //   let file = toSquare[0]; // d
            //   let rank = toSquare[1]; // 5
            //   let fenString = fen.split(" ")[0];
            //   let squareIndex = 0;
            //   fenString.split("").forEach((fenLetter) => {
            //     if (fenLetter !== "/") {
            //       if (parseInt(fenLetter) > 0 && parseInt(fenLetter) < 9) {
            //         // Als het 1 t/m 8 is...
            //         squareIndex = squareIndex + Number(fenLetter);
            //       }
            //     }
            //   });
            // }
            // let toSquare = receivedData.move.slice(-2); // d5
            // let fen = this.chessboard.fen;

            if (window.evtCounter == 1)
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
    }
    // ======================================================== BaseElement.$createElement
    // generic createElement function
    $createElement({ tag = "div", props = {} }) {
      return Object.assign(document.createElement(tag), props);
    }
    // ======================================================== BaseElement.resumeChessGame
    resumeChessGame(evt) {
      let { id, displayname } = ROADSTECHNOLOGY.CHESS;

      localStorage.setItem(CHESS.__MATCH_GUID__, evt.detail.data);
      location.assign(`match.html?id=${id}&name=${displayname}` /* , "_blank" */);

      // this.chessboard.fen = fen;
    }
  }; // end ChessBaseElement
  // ********************************************************** ChessBaseElement
})(); // end IIFE
