customElements.define(
  "todo-list",
  class extends CHESS.ChessBaseElement {
    connectedCallback() {
      super.connectedCallback();
      setTimeout(() => {
        this.innerHTML =
          `<b>todo:</b>` +
          `<ul>` +
          this.innerHTML
            .split(/[\n\*]/) // accepts newline | and # as 3 separators
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `<li>${line}</li>`)
            .join("") +
          `</ul>`;
      });
    }
  }
);
