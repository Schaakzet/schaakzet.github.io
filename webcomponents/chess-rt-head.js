// IIFE - Immediatly Invoked Function Expression, save from creating Global variables
!(function () {
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
                // console.log(idx, tag, uri, label, title, target);
                let isURI = (typeof uri == "string" && uri.startsWith("http")) || uri.includes("html");
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
  customElements.define(
    "h1-chess",
    class extends HTMLElement {
      connectedCallback() {
        //console.log([...document.scripts].map((x) => x.src));
        this.innerHTML =
          `<h1>Roads Technology SchaakZet - <a target=_blank href="https://github.com/Schaakzet/schaakzet.github.io">development</a> ${document.location.pathname}</h1>` +
          `<create-html>
            a|index.html|index
            |Play:
            a|match.html|match
            a|dashboard.html|dashboard
            |Develop:
            a|sandro.html|Sandro + Bart
            button|rob.html|Rob
            a|https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation|FEN wiki
            |Database:
            a|testDB.html|testDB
            a|https://schaakzet.nl/api/rt/index.php|RTAPI
            a|https://schaakzet.nl/api/crud/index.php/records/matchmoves|matchmoves
            a|https://treeql.org/|TreeQL
            a|https://github.com/mevdschee/php-crud-api#treeql-a-pragmatic-graphql|PHP-CRUD-API
            |<hr>
            </create-html>`;
        document.head.append(
          Object.assign(document.createElement("link"), {
            href: "chessgame.css",
            rel: "stylesheet",
          })
        );
      }
    }
  ); // h1-chess
  customElements.define(
    "todo-list",
    class extends HTMLElement {
      connectedCallback() {
        setTimeout(() => {
          this.innerHTML =
            `<b>todo:</b>` +
            `<ul>` +
            this.innerHTML
              .trim()
              .split("\n")
              .map((line) => `<li>${line}</li>`)
              .join("") +
            `</ul>`;
        });
      }
    }
  );
})();
