import { ChessGrid } from "./chess-grid.js";
import { importCss } from "../functions.js";
import { ChessPlayer } from "./chess-player.js";
import { ChessPiece } from "./chess-piece.js";
import {promotionMenu} from "./promotionMenu.js";

//todo
/*
include board color
allow all movement until a color is asigned to board
leave a way to walk for script input
send a msg to api when a move has been send and board has coresponding atribute

*/

class ChessBoard extends HTMLElement {
    constructor(id = 'iddv4', extra = true,player = `w/b`){
        super()

        this.id = id;
        extra && this.toggleAttribute('extra');
        
        //player get checked in secondclick and tile.setDraggable()
        //player = w || b
        this.player = player[0];
        this.selected = 0;
    }
    
    connectedCallback(){
        importCss('chess-board.css');
        this.constructBoard();
        this.fen = this.hasAttribute('fen')?  this.getAttribute('fen') : this.defaultFen ;

        //click, touch and drag handlers
        this.setEventListners();
    }

    get extra(){
        return this.hasAttribute(`extra`);
    }
    get db(){
        return document.querySelector(`game-container`).ws;
    }
    
    //interaction functions
    
    setEventListners(){
        //click
        document.addEventListener('click', e => this.clickHandler(e));
        this.addEventListener('contextmenu', e => this.rightClickHandler(e));

        //drag
        this.addEventListener("dragstart", (evt) => this.dragStartHandler(evt));
        document.addEventListener("dragover", (evt) => this.onMouseMove(evt));
        this.addEventListener("dragend", (evt) => this.dragEndHandler(evt));

        //touch
        this.addEventListener("touchstart", (evt) => this.dragStartHandler(evt));
        document.addEventListener("touchmove", (evt) => this.onMouseMove(evt));
        this.addEventListener("touchend", (evt) => this.dragEndHandler(evt));

        //todo db?
        document.addEventListener('db-move', (e) => this.dbMove(e));

    }


    //click functions
    clickHandler(e){
        //pointer id is there so touch/draggevents dont duble up
        if(e.pointerId == 1){
            if(e.target.nodeName == 'CHESS-TILE'){
                //we clicked in the gird
                this.selected == 0? this.firstClick(e) : this.secondClick(e);
    
            }else{
                // cliked away 
                e.target.parentElement?.nodeName == `PROMOTION-MENU`? false : this.clearSelected();
            }
        }
    }

    firstClick(e){
            e.target.piece?.color[0] == this.turnColor &&  this.setSelected(e.target.piece);
    }

    secondClick(e){
        if(e.target.moveType != false && this.selected[0].color[0] == this.player){
            //move
            this.moveHandler(e.target,this.selected[1],'click');

        }else{
            this.clearSelected();
            //go to clichandler to skip a click if another piece is selected
            this.clickHandler(e);
        }
    }

    rightClickHandler(e){
        //make right click same as leftclick or holding for touch
        // e.preventDefault();
        // this.clickHandler(e);
    }
    //end click functions

    //drag & touch functions
    dragStartHandler(e){
        if(e.target.draggable){
            this.setSelected(e.target.piece);
    
            //remove ghost img
            e.type == 'dragstart' && e.dataTransfer.setDragImage(document.createElement(`div`),0,0);
            e.type == 'touchstart' && e.preventDefault();
    
            //prime dragdiv
            const i = e.clientX ? e : e.changedTouches[0];
            const xline = i.clientX - e.target.getBoundingClientRect().x;
            const yline = i.clientY - e.target.getBoundingClientRect().y;
            this.dragdiv.style.setProperty("--xline", `${xline}px`);
            this.dragdiv.style.setProperty("--yline", `${yline}px`);
            this.onMouseMove(e);
    
            //apend to mdiv
            e.type == 'dragstart'? setTimeout(() => {this.dragdiv.append(e.target.piece)}) : this.dragdiv.append(e.target.piece);

        }
    }
    dragEndHandler(e){
        let endElement = e.type == 'dragend'? document.elementFromPoint(e.clientX, e.clientY) : document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        endElement.moveType? this.moveHandler(endElement,this.selected[1],'drag') : this.clearSelected(true);
    }
    //end drag & touch functions

    setSelected(piece){
        this.selected = [piece,piece.cell];
        this.gridNode.showSelect(this.selected);
    }

    clearSelected(drag = false){
        console.log('clearselected');
        drag && this.selected != 0 && this.animatePiece(this.selected[1],this.selected[0]);
        this.gridNode.clearHighlight();
        this.selected = 0;
    }

    onMouseMove(e) {
        if (e.clientX) {
            this.dragdiv.style.left = `calc(${e.clientX}px - var(--xline))`;
            this.dragdiv.style.top = `calc(${e.clientY}px - var(--yline))`;
        } else {
            this.dragdiv.style.left = `calc(${e.changedTouches[0].clientX}px - var(--xline))`;
            this.dragdiv.style.top = `calc(${e.changedTouches[0].clientY}px - var(--yline))`;
        }
        return false;
    }

    dbMove(e){
        const data = e.detail;
        const [toCell,fromCell] = this.moveInterpreter(data.move,this.fen);
        //todo add promotion 
        const promotion = data.move.length == 6 ? data.move[5] : false;
        this.moveHandler(toCell,fromCell,`db`, promotion);
    }

    moveInterpreter(move,fen){
        let toCell = '';
        let fromCell = '';
        if(move == `0-0-0` || move == '0-0' || move == 'o-o-o' || move == 'o-o'){
            //0-0-0 || 0-0
            const rank = fen.includes('w')? '1': '8';
            const file = move == '0-0-0' || move == 'o-o-o'? 'c' : 'g'
            fromCell = 'e'+rank;
            toCell = file+rank; 
        }
        else{
            //normal move
            toCell = move.substring(3);
            fromCell = move.substring(0,2);
        }
        return [toCell,fromCell];
    }

//end interaction funtcions

//movement functions

async moveHandler(toCell,fromCell,type = false,promotion = false){
    if(toCell.nodeName !=  "CHESS-TILE"){
        toCell = this.gridNode.getCell(toCell);
        fromCell = this.gridNode.getCell(fromCell);
    }
    type == 'db' && this.setSelected(fromCell.piece);

    const piece = type == 'drag' || type == 'touch'? this.selected[0] : fromCell.piece;
    //check valid input
    if(type == 'drag' || type == 'touch') fromCell.append(piece);
    if(!piece.finalMoves.includes(toCell)) return 'invalid move';
    
    //check promotion
    if(piece.type == 'pawn' && !promotion && (this.rows[0].includes(toCell) || this.rows[this.rowCount -1].includes(toCell))){
         promotion = await this.pawnPromotion();
        
    }
    //move piece
    const move = piece.type == 'king' && (toCell.x - fromCell.x) % 2 == 0 && toCell.y == fromCell.y? this.castlingMove(toCell,fromCell,piece,type) : this.normalMove(toCell,fromCell,piece,type,promotion);
    this.clearSelected();
    this.updateLog(move);

    //update fen
    this.updateFen(toCell,fromCell,piece);

    //timeout to wait for the animation to be done so draw works for only 2 kings remain
    setTimeout(() => {          
        //update draggable
        this.updateDraggable();
    
        //send to db?
        if(type != 'db'){
            //send move
            //todo
            this.db.move(this.id,move,this.fen);
        }
        //check win ?
        if(this.checkWin()){
            console.warn('we have a winner');
            this.HandleWin(this.checkWin(),type);
        }
    });
    

}

normalMove(toCell,fromCell,piece,type,promotion){
    this.movePiece(toCell,piece,type);
    let extraMoveBit = '';
    if(promotion){
        promotion = piece.color == "white"? promotion.toUpperCase() : promotion;
        extraMoveBit = promotion
        piece.remove();
        const newPiece = new ChessPiece(promotion);
        toCell.append(newPiece);
    }
    return  fromCell.chessCoord+(toCell.moveType == 'move'? '-': 'x')+toCell.chessCoord+extraMoveBit;
}
castlingMove(toCell,fromCell,piece,type){
    this.movePiece(toCell,piece,type);
    const rook = toCell.x - fromCell.x <0? this.gridNode.getCell([0,piece.y]).piece : this.gridNode.getCell([7,piece.y]).piece ;
    this.movePiece(this.gridNode.getCell(toCell.x -(toCell.x - fromCell.x)/2,fromCell.y) ,rook,'db');
    return toCell.x - fromCell.x <0 ? '0-0-0' : '0-0';
}

movePiece(toCell,piece,type){
    if(toCell.moveType == "attack"|| toCell.piece){
        //send piece to graveyard
        //check inpassing move
        if(toCell == this.gridNode.getCell(this.inPassing) && piece.type == 'pawn'){
                const y = piece.color == 'white'? 1 : -1;
                const tile = this.gridNode.getCell(toCell.x,toCell.y + y);
                setTimeout(() => {
                    this.extra? this.animatePiece(this[`${tile.piece.color}graveyard`],tile.piece): tile.piece.remove();
                },);
        }else{
            setTimeout(() => {
                this.extra? this.animatePiece(this[`${toCell.piece.color}graveyard`],toCell.piece) : toCell.piece.remove();
            },);
        }
    }
    type == 'click' || type == 'db'? this.animatePiece(toCell,piece) : toCell.append(piece);
}

animatePiece(to,piece){
    const from = piece.cell? piece.cell : this.dragdiv; 
     //get cords where the cards is
     const [x0, y0] = [piece.getBoundingClientRect().x, piece.getBoundingClientRect().y];
     //get cords where the cards has to go
     to.append(piece);
     const [x1, y1] = [piece.getBoundingClientRect().x, piece.getBoundingClientRect().y];
     from.append(piece);
     // calcutlate distanse and using that to get a time so cards move at a constant speed 
     const distanse = Math.sqrt(Math.pow(Math.abs(x0 - x1), 2) + Math.pow(Math.abs(y0 - y1), 2));
     const duration = 350;
     


     piece.animate(
         [{ zIndex: 1, transform: `translate(${x0 - x1}px,${y0 - y1}px)` }, { zIndex: 1, transform: `translate(0)` }],
         {
             duration: duration,
             easing: "linear",
         }
     );
     //when animation finishd apend to new cardpile
     to.append(piece);
}

async pawnPromotion(){
    console.log('pawnpromote');
    const menu = new promotionMenu() 
    //show promotion menu
    this.append(menu);
    //make the promise and the resolve on the click listners from the menu to wait user imput
    return new Promise(resolve => {
        menu.imgs.map(img => {
            img.addEventListener('click', () =>{

                resolve(img.value);
                menu.remove();
            })
        })
    })
}

updateLog(move){
    if(this.extra){
        const p = document.createElement('li');
        p.innerText = move;
        this.movelog.append(p);
    }
}

updateFen(toCell,fromCell,piece){
    //updatecastling
    if(piece.type == 'rook' || piece.type == 'king'){
        if(piece.type == 'rook'){
            const letter = fromCell.x == 0? piece.color == 'white'? "Q" : "q"  : fromCell.x == 7? piece.color == 'white'? 'K' : 'k' : false ;
           this.castlingFen = this.castlingFen.replace(letter ,'');
        }
        else if(piece.type == 'king'){
            if(piece.color == 'white' && fromCell == this.gridNode.getCell('e1')){
                this.castlingFen = this.castlingFen.replace('Q','');
                this.castlingFen = this.castlingFen.replace('K','');
            }
            else if (piece.color == 'black' && fromCell == this.gridNode.getCell('e8') ){
                this.castlingFen = this.castlingFen.replace('q','');
                this.castlingFen = this.castlingFen.replace('k','');
            }
        }
        if(this.castlingFen.length == 0)this.castlingFen = '-';
    }
    //update inPassing if the move is even and piece = pawn get passing tile otherwise -
    this.inPassing =  (toCell.y - fromCell.y) % 2 == 0 && piece.type == "pawn"? this.gridNode.getCell(toCell.x,fromCell.y +(toCell.y - fromCell.y)/2).chessCoord : '-';
    //update turncolor
    this.turnColor = this.othercolor;
    // update fen atribute ?
    this.setAttribute('fen',this.fen);
}

updateDraggable(){
    //flips the side thats playable
    this.gridNode.pieces.map(piece => {piece.cell.setDragable()});
    //clears the fromsquare being dragable
    this.gridNode.draggableTiles.map(tile =>{tile.setDragable()});
}

// end movement functions
//check win stuf

    get checkCheckMate(){
        //check if its inCheck and all the pieces cant move
    return this.gridNode.inCheck && this.gridNode[`${this.color}Pieces`].map(piece => {return piece.finalMoves.length}).every((x) => x == 0);
    }

    get checkStaleMate(){
        return (!this.gridNode.inCheck && this.gridNode[`${this.color}Pieces`].map(piece => {return piece.finalMoves.length}).every((x) => x == 0)) || Array.from(this.gridNode.querySelectorAll(`chess-piece`)).length == 2 ;
    }

    checkWin(){
        return this.checkCheckMate? this.color =='white'? 'black' : 'white' : this.checkStaleMate? 'draw' : false;
    }

    HandleWin(color,db=false){
        // white black draw
        //send to db if db move is false so only 1 board sends the query
        db != 'db' && this.db.endGame(color);
        //todo make somthing onscreen to show endstate
        const div = document.createElement(`h3`);
        div.id = `winmsg`;
        div.classList.add(`wrapper`);
        div.innerText = color != 'draw'? `${color} has won` : `its a ${color}`;
        this.parentElement.append(div); 

    }

//end check win stuf

    get movelog(){
        return this.querySelector(`#movelog`);
    }
    get blackgraveyard(){
        return this.querySelector(`#graveyard_black`);
    }
    get whitegraveyard(){
        return this.querySelector(`#graveyard_white`);
    }

    get dragdiv(){
        return this.querySelector(`#dragdiv`);
    }

    get color(){
        return this.turnColor == 'w'? 'white' : this.turnColor == 'b'? 'black' : false;
    }

    //grid getters
        get gridNode(){
            return this.querySelector('chess-grid');
        }

        get grid(){
            return this.gridNode.grid;
        }

        get rowCount(){
            return this.gridNode.x
        }

        get columnCount(){
        return this.gridNode.y;
        }

        get rows(){
        return this.gridNode.rows;
        }

        get columns(){
        return this.gridNode.columns;
        }
    //end grid getters
    //fen stuf
        get defaultFen(){
            return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0';
        }

        get fen(){
            return this.gridNode.gridFen+' '+this.turnColor+' '+this.castlingFen+' '+this.inPassing;
        }

        set fen(fen){
            const [gridFen,turnColor,castlingFen,apFen,fulFen,halfFen] = fen.split(' ');
            
            this.turnColor = turnColor;
            this.castlingFen = castlingFen;
            this.inPassing = apFen;
            
            //gridFen
            let count = 0;
            gridFen.split('/').map(row => { 
                Array.from(row).map(letter =>{
                    if (letter != +letter){
                    // we have a piece
                    this.grid[count].append(new ChessPiece(letter));
                    count ++;
                }
                else{
                    count += +letter;
                }
            });
            });
        }     

        get othercolor(){
            return this.turnColor == 'w'? 'b' : 'w'; 
        }

        checkFen(fen){
            // check valid fen
        }


    //end fen stuf
    //board creation
        constructBoard(){
            //make board grid and border
            const span = document.createElement('div');
            span.id = `chessboardwrapper`;
            this.append(span)
            span.append(new ChessGrid);
            span.append(...this.makeBorder());
            //make moves log earya and graveyard
            if(this.extra){
                this.append(this.makeGraveyard());
                this.append(this.makeMoveLog());
            }
            //dragdiv
            const dragdiv = document.createElement('div');
            dragdiv.id = 'dragdiv';
            this.append(dragdiv);
        }  
        makeBorder(){
            const arr = [];
            for(let i = 0; i < 4; i++){
                const div = document.createElement('div');
                if(i % 2){
                    // make column bar
                    div.classList.add('columnbar');
                    div.setAttribute('y', this.columnCount)
                    for(let i = 0;i<this.rowCount;i++){
                        const letter = document.createElement("div");
                        letter.innerText = String.fromCharCode(i+65);
                        this.player == `w`? div.append(letter): div.prepend(letter);
                    }
                }
                else{
                    //make row bar
                    div.classList.add('rowbar');
                    for(let i = 0;i<this.columnCount;i++){
                        const number = document.createElement("div");
                        number.innerText = 8- (i );
                        this.player == `w`? div.append(number): div.prepend(number);
                    }
                }
                arr.push(div);
            }
            return arr;
        }
        makeGraveyard(){
            const div1 = document.createElement('div');
            const div2 = document.createElement('div');
            div1.id = 'graveyard_white';
            div2.id = 'graveyard_black';
            const div3 = document.createElement('div');
            div3.id = 'graveyards';
            div3.append(...[div1,div2]);
            return div3;
        }
        makeMoveLog(){
            const div = document.createElement(`ol`);
            div.id = 'movelog';
            return div;
        }
    //end board creation

};//end ChessBoard

customElements.define(`chess-board`, ChessBoard);
export {ChessBoard};
console.log('chess-board.js loaded');