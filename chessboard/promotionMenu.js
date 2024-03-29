import { ChessPiece } from "./chess-piece.js";
import { importCss } from "../functions.js";
class promotionMenu extends HTMLElement{
    constructor(){
        super()
        importCss('promotionmenu.css');
    }

    connectedCallback(){
        this.setAttribute('promotion','queen,rook,bishop,knight');
        this.constructImage(this.optionAttr);
    }

    closestElement(selector, el = this) {
        return (
            (el && el != document && el != window && el.closest(selector)) ||
            this.closestElement(selector, el.getRootNode().host)
        );
    }

    get board(){
        return this.closestElement('chess-board');
    }

    get optionAttr(){
        return Array.from(this.attributes).map(attr =>{
            if(!(attr.name == 'id' || attr.name == 'class')) return attr;
        }).filter(n => n)[0];
    }

    get imgs() {
        return Array.from(this.querySelectorAll(`img`));
    }

    constructImage(attr){
        attr.value.split(",").map(value =>{
            console.log(this.board.turnColor);
            let ltr = this.board.turnColor == 'w'? value[0].toUpperCase() : value[0];
            ltr = ltr.toLowerCase() == 'k'? this.board.turnColor == 'w'? 'N' : 'n' : ltr;
            const team = ltr == ltr.toUpperCase()? 'white' : 'black';
            const img = document.createElement(`img`);
            img.value = ltr
            img.src = `./svg/${team}-${value}.svg`;
            img.width = 80;
            img.height = 80;
            this.append(img);
        });
    }

}
customElements.define('promotion-menu', promotionMenu);
export {promotionMenu};