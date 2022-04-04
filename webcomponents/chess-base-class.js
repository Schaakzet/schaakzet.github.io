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

  dispatch({
    root = this,
    detail = {}, // event.detail
    options = {
      bubbles: true,
      composed: true,
      cancelable: false,
    },
  }) {
    root.dispatchEvent(
      new CustomEvent(CHESS.__STORECHESSMOVE__, {
        ...options, //
        detail,
      })
    );
  }
  listen() {}
};
