// ********************************************************** class Player
class ChessPlayer extends HTMLElement {
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
      input.onblur = (evt) => showinput(false);
    }
  }
  customElements.define("chess-player-white", class extends ChessPlayer {});
  customElements.define("chess-player-black", class extends ChessPlayer {});
  