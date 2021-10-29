/*
 <schaak-bord> Web Component
*/
customElements.define("schaak-bord", class extends HTMLElement {
    connectedCallback() {
        this.createboard("SCHAAKBORD_ROB");
    }
    createboard(name) {
        let templ = document.querySelector(`template[id="${name}"]`).content;
        this.append(templ.cloneNode(true));
        this.board = document.querySelector("#schaakbord");
    }
    addPiece(piece, position = "d5") {
        let layer_pieces = this.querySelector("#layer_pieces");	
        let schaakstuk = document.createElement("schaak-stuk");
        schaakstuk.setAttribute("is", piece);
        schaakstuk.setAttribute("at", position);
        return layer_pieces.appendChild(schaakstuk);
    }
    set fen(fenstring = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {

    }
    get fen() {
        // return fen string
    }
    move(fromsquare, tosquare) {

    }
    movePiece(piece, tosquare) {

    }
});
