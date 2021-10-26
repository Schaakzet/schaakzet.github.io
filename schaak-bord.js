const files = ["A","B","C","D","E","F","G","H"];
const ranks = ["1","2","3","4","5","6","7","8"].reverse();

let squares = [ "A8","A7", "A6", "....","H1"];


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
