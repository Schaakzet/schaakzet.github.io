/*
 <schaak-bord> Web Component
*/
customElements.define("schaak-bord", class extends HTMLElement {
    connectedCallback() {
        this.create("SCHAAKBORD_ROB");
    }
    create(name) {
        let templ = document.querySelector(`template[id="${name}"]`).content;
        this.append(templ.cloneNode(true));
        this.board = document.querySelector("#schaakbord");
    }
    add(piece, position = "d5") {
        let schaakstuk = document.createElement("schaak-stuk");
        schaakstuk.setAttribute("is", piece);
        schaakstuk.setAttribute("at", position);
        return this.board.appendChild(schaakstuk);
    }
})
