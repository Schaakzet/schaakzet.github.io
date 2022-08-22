!(function () {
  /* BaseClass for <chess-board>,<chess-square>,<chess-piece>

  class:ChessBaseElement
    -► class:ChessBaseSquarePieceElement
      -► component:<chess-square>
      -► component:<chess-piece>
      -► component:<chess-board>
  */
  const __COMPONENT_NAME__ = "BaseClass";

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
          background: "royalblue",
          color: "white",
          labelbackground: "skyblue",
          ...logComponent,
          // stacktrace: true,
        },
        ...arguments
      );
  }

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
      if (logDetail > 0) log(`${root.localName||root.nodeName} dispatch:`,name, detail);
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
      CHESS.EVENTSOURCE.initialize({ root });
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
