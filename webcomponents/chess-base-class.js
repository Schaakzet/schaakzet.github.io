// ********************************************************** ChessBaseElement
// one BaseClass for all to be created Custom Elements/Web Components
CHESS.ChessBaseElement = class extends HTMLElement {
  // ======================================================== constructor
  constructor() {
    super();
  }
  // ======================================================== connectedCallback
  connectedCallback() {
    // ------------------------------------------------------- listen to <x-y> events
    document.addEventListener(this.localName, (e) => {
      let { value: valueMethod } = evt.detail;
      // if a method on this DOM element exists
      if (this[valueMethod]) {
        this[valueMethod](e); // call method
      }
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
  // ======================================================== BaseElement.listen
  listen() {}
  // ======================================================== BaseElement.listen2matchmoves
  listen2matchmoves(
    root = this // disppatch matchid name event from this root (this = default)
  ) {
    function log(...args) {
      console.log(`%c EventSource ${args.shift()} `, "background:blue;color:white", ...args);
    }
    // subscribe to a server Event Source,
    // it sends an update for every made matchmove recorded in the database
    const API = CHESS.APIRT.__API_MATCHMOVES_EVENTSOURCE__;
    log("init", API);
    try {
      const evtSource = new EventSource(API);
      evtSource.onmessage = (evt) => {
        // respond to the Event
        if (evt.data) {
          // console.clear();
          log("Received", evt.data);
          const receivedData = JSON.parse(evt.data); //! TODO this can be data for multiple matches!
          root.dispatch({
            name: receivedData.match_guid, // event name is the match_guid
            detail: receivedData,
          });
        }
      };
    } catch (e) {
      console.error("Event Source error", API);
    }
  }
  // ======================================================== BaseElement.$createElement
  $createElement({ tag = "div", props = {} }) {
    return Object.assign(document.createElement(tag), props);
  }
  // ======================================================== BaseElement.resumeChessGame
  resumeChessGame(match_guid, fen) {
    let id = new URLSearchParams(document.location.search).get("id");
    let name = new URLSearchParams(document.location.search).get("name");

    localStorage.setItem(CHESS.__MATCH_GUID__, match_guid);
    window.open(`match.html?id=${id}&name=${name}` /* , "_blank" */);
    // this.chessboard.fen = fen;
  }
  // end ChessBaseElement
};
// ********************************************************** ChessBaseElement
