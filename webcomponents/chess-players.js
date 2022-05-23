!(function () {
  class ChessPlayer extends CHESS.ChessBaseElement {
    connectedCallback() {
      let placeholder = this.localName;
      this.innerHTML = /*html*/ `<label>${this.getAttribute("label") || ""}<input type="text" placeholder="${placeholder}" value="${
        this.getAttribute("name") || ""
      }"></label><span style="background:lightgrey"></span>`;
      let input = this.querySelector("input");
      const showinput = (state) => {
        let name = "";
        if (state) {
          input.style.display = "inherit";
          input.focus();
          input.setSelectionRange(0, input.value.length);
          this.querySelector("span").innerHTML = "";
          input.selectionStart = input.selectionEnd = 10000;
        } else {
          input.style.display = "none";
          name = input.value || placeholder;
        }
        this.querySelector("span").innerHTML = name;
      };

      showinput(!this.hasAttribute("name"));
      this.onkeyup = (evt) => evt.keyCode == 13 && showinput(false);
      this.onclick = (evt) => showinput(true);
      input.onblur = (evt) => {
        showinput(false);
        this.dispatch({ name: "inputValue" });
      };
    }

    get value() {
      return this.querySelector("input").value;
    }
  }
  customElements.define("chess-player-white", class extends ChessPlayer {});
  customElements.define("chess-player-black", class extends ChessPlayer {});
  customElements.define(
    "chess-players",
    class extends CHESS.ChessBaseElement {
      connectedCallback() {
        this.innerHTML = `
      <chess-player-white name="Player White"></chess-player-white>
      versus
      <chess-player-black name="Player Black"></chess-player-black>`;
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue && name == CHESS.__WC_ATTRIBUTE_PLAYER__) {
          this.name = newValue;
        }
      }
    }
  );
})();
