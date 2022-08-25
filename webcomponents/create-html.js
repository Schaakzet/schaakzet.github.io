!(function () {
  const __COMPONENT_NAME__ = "create-html";
  /* 
  <create-html> creates HTML from configuration strings

  <create-html>button|chess-match:removeMatch|Quit Match</create-html>

  USAGE: 
  button|eventName:detailValue|buttonText
  Will trigger an eventName with detailValue when clicked.

  a|index.html|schaakzet
  creates <a href="index.html">schaakzet</a>

  !todo: document usage for select/options (see code below)
  */
  // custom log colors for this file
  function log() {
    console.log(`%c ${__COMPONENT_NAME__} `, "background:lightcoral;color:white", ...arguments);
  }

  customElements.define(
    __COMPONENT_NAME__,
    class extends CHESS.ChessBaseElement {
      // ================================================== connectedCallback
      connectedCallback() {
        super.connectedCallback();
        setTimeout(() => {
          // wait till innerHTML is parsed
          this.innerHTML = this.innerHTML
            .trim()       // remove whitespace
            .split("\n")  // split by newline
            .map(
              (
                line      // process each line
              ) =>
                line
                  .trim() // trim whitespace
                  .split(this.getAttribute("separator") || "|") // split by (defined) separator
            )
            .filter(Boolean) // remove all empty lines
            .map(([tag, uri, label, title = label, target = "_blank", className = ""], idx) => {
              if (tag) {
                //console.log(idx, tag, uri, label, title, target);
                let isURI = (typeof uri == "string" && uri.startsWith("http")) || (uri && uri.includes("html"));
                return (
                  {
                    br: `<br>`,
                    a: `<a class="${className}" title="${title}" target="${target}" href="${uri}">${label}</a>`,
                    // ------------------------------------------------- BUTTON: goto URI or dispatch event
                    button: isURI
                      ? `<button class="${className}" title="${title}" onclick="document.location='${uri}'">${label}</button>`
                      : `<button class="${className}" title="${title}" onclick="this.closest('create-html').dispatch(this,'${uri}')">${label}</button>`,
                    input:
                      uri == "select"
                        ? `<select class="${className}" name="${label}" >` +
                          title
                            .split(",")
                            .map((o) => `<option value="${o}">${o}</option>`)
                            .join("") +
                          `</select>`
                        : `<input type="${uri}" placeholder="${label}" value="${title}">`,
                  }[tag] || tag
                );
              } else {
                return `<strong>${uri}</strong>`;
              } // if(tag)
            }) // map
            .join(" - ");
        });
      } // connectedCallback

      // ================================================== dispatch
      dispatch(button, eventName) {
        let [name, value, data] = eventName.split(":");
        log(`dispatch:${name} detail:`, value, "scope:", this);
        this.dispatchEvent(
          new CustomEvent(name, {
            bubbles: true,
            composed: true,
            cancelable: false,
            detail: {
              value,
              button,
              data,
            },
          })
        ); // dispatchEvent
      } // dispatch
    } // class
  ); // customElements.define
})(); // end IIFE
