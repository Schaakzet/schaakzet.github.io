import './chessboard/chess-board.js';
import { ChessBoard } from './chessboard/chess-board.js';
import { MenuButton } from './customButton.js';
import { DbHandler } from './dbcaller.js';
import {importCss, uuidv4 } from './functions.js';
import { MainMenu } from './optionmenu.js';


class GameContainer extends HTMLElement{
    constructor(){
        super()

        if(this.playerData == null){
            localStorage.setItem('playerData',JSON.stringify({'userID' : uuidv4()}));
            this.playerData = localStorage.getItem('playerData');
        }

        //ws
        this.ws = new DbHandler;
    }

    get playerData(){
        return JSON.parse(localStorage.getItem('playerData'));
    }

    connectedCallback(){
        if(this.playerData == null){
            //make optionscreen to give 
        }
        importCss(`container.css`);
        this.setEventListners();
    }

    setEventListners(){
        document.addEventListener(`db-newgame`, e => this.makeChessBoard(e));
        document.addEventListener(`db-joinGame`, e => this.makeChessBoard(e));
        document.addEventListener(`db-getOpenGames`, e => this.makeLobyBrowser(e));
    }
    closestElement(selector, el = this) {
        return (
            (el && el != document && el != window && el.closest(selector)) ||
            this.closestElement(selector, el.getRootNode().host)
        );
    }

    //todo remake to make implement generic game
    makeChessBoard(e){
        const id = e.detail.response;
        const player = e.detail.player == `player1`? 'w' : 'b';
        this.clear();
        console.log(e);
        const banner = document.createElement(`label`);
        banner.classList.add(`wrapper`);
        banner.innerText = `ID = ` + id;
        this.prepend(banner);
        const chesBoard = new ChessBoard(id,true,player);
        console.log(chesBoard);
        this.append(chesBoard);
    }
    loadGame(e){
        this.clear();
        console.log(e);
        const banner = document.createElement(`label`);
        banner.innerText = `ID = ` + e.detail;
        this.prepend(banner);
        const chesBoard = new ChessBoard(e.detail,true);
        console.log(chesBoard);
        this.append(chesBoard);
    }

    makeOptionMenu(){
        //todo
    }

    makeLobyBrowser(e){
        //todo
        console.log(e);
        console.warn(e.detail);
        this.clear()
        const loby = document.createElement(`div`);
        loby.id = `lobybrowser`;
        loby.innerHTML = /*html*/`
            <div>host</div>
            <div>gametype</div>
            <div>players</div>
            <div></div>
        `;
        e.detail.response.map(match => {
           const div = /*html*/`
                        <div>${match.boardID}</div>
                        <div>${match.boardType}</div>
                        <div>?/${match.playerLimit}</div>
                        <button id=${match.boardID}>join</button>
                    `;
            loby.innerHTML += div;
            // loby.append(new MenuButton(`multijoin`,match.boardID));
        })
        this.append(loby);
        this.addEventListener(`click`, e => this.lobybutton(e));
    }

    lobybutton(e){
        console.log(`click `,e.target.nodeName)
        if(e.target.nodeName == `BUTTON`){
            this.ws.joinGame(e.target.id,this.playerData.userID);
        }
    }
    makeMainmenu(){
        //todo
        this.clear()
        /* new game | joingame | lobybrowser | watch game | optionmenu */
        // const newgameBtn = this.makeButton(`newgame`,`new game`,this,this.btnNewGame);
        // this.append(newgameBtn);
        this.append(new MainMenu());

    }

    clear(){
        this.innerHTML = '';
    }
    btnNewGame(e){
        //the this for the funtion is button so wen need to pass the button to 
        //send ws call to newgame
        //
        e.clear()
        console.log(e);
        e.makeChessBoard()
    }

    makeButton(id, text,node, click){
        const button = document.createElement('button');
        button.id = id;
        button.innerText = text? text : id;
        button.onclick = ( e => click(node));
        return button;
    }
      


  
}
customElements.define('game-container', GameContainer);

export {GameContainer};
console.log('container.js loaded');