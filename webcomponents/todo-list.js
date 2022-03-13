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
