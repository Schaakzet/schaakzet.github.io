class ChessTile extends HTMLElement{
    constructor(x,y){
        super()
        this.x = x;
        this.y = y;
        this.setAttribute('coord', `[${x},${y}]`);
    }

    connectedCallback(){
        this.setBackgroundColor();
        this.addEventListener("dragover", (evt) => this.dragoverHandler(evt));
        this.addEventListener("mouseenter", (evt) => this.mouseEnterHandler(evt));
        this.addEventListener("mouseleave", (evt) => this.mouseLeave(evt));
    }

    closestElement(selector, el = this) {
        return (
            (el && el != document && el != window && el.closest(selector)) ||
            this.closestElement(selector, el.getRootNode().host)
        );
    }
    get grid() {
        return this.closestElement("chess-grid");
    }

    get board(){
        return this.closestElement('chess-board');
    }

    get coord(){
        return JSON.parse(this.getAttribute('coord'));
    }

    get chessCoord(){// ec e1 or g6
        return String.fromCharCode(this.coord[0]+65).toLocaleLowerCase()+(7-this.coord[1]+1);
    }

    get piece(){
        return this.querySelector('chess-piece');
    }

    get moveType(){
        // return move attack or false
    return  this.hasAttribute('attack')? 'attack' : this.hasAttribute('move')? "move" : false;
    }

    setBackgroundColor(){
        // if row and column are even color 1 and if row and culomn are odd color 1 else color 2
        this.toggleAttribute((((this.y +1) % 2 == 0 && (this.x + 1) % 2 == 0) || ((this.y +1) % 2 != 0 && (this.x + 1) % 2 != 0) ? 'light' : 'dark') ,true)
    }

    mouseEnterHandler(e){
        this.piece && this.board.selected == 0 && this.grid.showSelect([this.piece, this]);
    }
    mouseLeave(e){
        this.board.selected == 0 && this.grid.clearHighlight();
    }

    setDragable(){
        this.draggable = this.piece && this.board.turnColor == this.piece?.color[0] && this.board.player == this.piece?.color[0] ? true : '';
        !this.draggable && this.removeAttribute(`draggable`);
    }

    dragoverHandler(e){
        this.moveType && e.preventDefault();
        return false
    }
}
customElements.define('chess-tile', ChessTile);

export {ChessTile}
console.log('chess-tile.js loaded');