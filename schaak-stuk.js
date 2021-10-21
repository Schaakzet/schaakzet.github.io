/*
    <schaak-stuk> Web Component
*/
customElements.define(
    "schaak-stuk",
    class extends HTMLElement {
      connectedCallback() {
        this.innerHTML = `<img src="https://schaakzet.github.io/img/${this.getAttribute("is")}.png">`;
      }
    }
  );
  
