customElements.define(
  "create-html",
  class extends HTMLElement {
    connectedCallback() {
      setTimeout(() => {
        this.innerHTML = this.innerHTML
          .trim()
          .split("\n")
          .map((line) => line.trim().split(this.getAttribute("separator") || "|"))
          .filter(Boolean)
          .map(([tag, uri, label, title = label, target = "_blank"], idx) => {
            if (tag) {
              //console.log(idx, tag, uri, label, title, target);
              let isURI = (typeof uri == "string" && uri.startsWith("http")) || (uri && uri.includes("html"));
              return (
                {
                  br: `<br>`,
                  a: `<a title="${title}" target="${target}" href="${uri}">${label}</a>`,
                  button: isURI
                    ? `<button onclick="document.location='${uri}'">${label}</button>`
                    : `<button onclick="this.closest('create-html').dispatch(this,'${uri}')">${label}</button>`,
                  input:
                    uri == "select"
                      ? `<select name="${label}" >${title
                          .split(",")
                          .map((o) => `<option value="${o}">${o}</option>`)
                          .join("")}</select>`
                      : `<input type="${uri}" placeholder="${label}" value="${title}">`,
                }[tag] || tag
              );
            } else return `<b>${uri}</b>`;
          })
          .join(" - ");
      });
    }
    dispatch(button, eventName) {
      console.log("dispatch", eventName, button);
      this.dispatchEvent(
        new CustomEvent(eventName, {
          bubbles: true,
          composed: true,
          cancelable: false,
          detail: {},
        })
      );
    }
  }
);
