class MenuButton extends HTMLElement {
    constructor(btntype, id){
        super()

        switch(btntype){
            case `newGame`:
                this.id = 'newgame';
                this.innerText = 'new game';
                this.onclick = this.btnNewGame;
            break;
            case 'joinGame':
                this.id = 'joingame';
                this.innerHTML = /*html*/`<input type="text"><br>join game`;
                this.onclick = this.btnJoinGame;
            break;
            case 'multieplayer':
                this.id = 'multieplayer';
                this.innerText = 'multieplayer';
                this.onclick = this.btnMultieplayer;
            break;
            case 'options':
                this.id = 'options';
                this.innerText = 'options';
                this.onclick = this.btnJoinGame;
            break;

        }
    }

    connectedCallback() {

    }

    closestElement(selector, el = this) {
        return (
            (el && el != document && el != window && el.closest(selector)) ||
            this.closestElement(selector, el.getRootNode().host)
        );
    }

    get ws(){
        return this.containter.ws;
    }
    get containter(){
        return this.closestElement(`game-container`)
    }


    //btn functions
    btnNewGame(e){
        //the this for the funtion is button so wen need to pass the button to 
        //send ws call to newgame
        //
        console.log('newgame btn pressed');
        if(this.ws.makeGame() != 1){
            console.log(`failed`);
            //todo eror handling
        } 
    }
    btnJoinGame(e){
        //open up a textfield to imput board id and send it to ws
        //todo
        if(this.firstChild.value.length > 0){
            console.log(this.firstChild.value);
            if(this.ws.joinGame(this.firstChild.value, this.containter.playerData.userID) != 1){
                console.log(`failed`);
                //todo eror handling
            }
        }
    }
    btnMultieplayer(e){
        //generate a lobybrowser with
        this.ws.getOpenGames();
    }



}
customElements.define(`custom-button`, MenuButton);
export { MenuButton}