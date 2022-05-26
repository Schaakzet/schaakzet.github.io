// ********************************************************** ChessBaseElement
// one BaseClass for all to be created Custom Elements/Web Components
CHESS.ChessBaseElement = class extends HTMLElement {
  constructor() {
    super();
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
      // subscribe to a server Event Source,
      // it sends an update for every made matchmove recorded in the database
      const API = CHESS.__API_MATCMOVES_EVENTSOURCE__;
      try {
        const evtSource = new EventSource(API);
        evtSource.onmessage = (evt) => {
          // respond to the Event
          const receivedData = JSON.parse(evt.data); //! TODO this can be data for multiple matches!
          root.dispatch({
            name: receivedData.match_id, // event name is the match_id
            detail: receivedData,
          });
        };
      } catch (e) {
        console.error("Event Source error", API);
      }
    }
    // ======================================================== BaseElement.deleteMatch
    // end ChessBaseElement
  };
  // ********************************************************** ChessBaseElement
  