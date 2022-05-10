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
  listen() {}
};
