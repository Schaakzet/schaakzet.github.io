import { MenuButton } from "./customButton.js"

class Menu extends HTMLElement{
    constructor(){
        super()

    }
    
    connectedCallback(){

    }

}

class MainMenu extends Menu {
    constructor(){
        super()
    }

    connectedCallback(){
        this.makeButtons();
    }

    makeButtons(){
        this.append(new MenuButton('newGame'));
        // this.append(new MenuButton('joinGame'));
        this.append(new MenuButton('multieplayer'));
        // this.append(new MenuButton('options'));
        // this.append(new MenuButton('observer'));
    }

}
customElements.define(`main-menu`,MainMenu)

class optionmenu extends Menu{
    constructor(arr){
        super()
        //arr with all the optionbuttons
    }


}
customElements.define(`option-menu`,optionmenu);
console.log(`optionmenu.js loaded`);
export {optionmenu,MainMenu};