import {ChessTile} from "./chess-tile.js";
import { importCss } from "../functions.js";

class ChessGrid extends HTMLElement{
    constructor(columns = 8 , rows = 8 ){
        super()
        this.x = columns;
        this.y = rows;
        this.grid = this.makeGrid(columns,rows);
        this.style = `--x : ${columns} ;`;

    }

    connectedCallback(){
        importCss('chess-grid.css');

       this.board.player == `w`? this.append(...this.grid) : this.grid.map(cell => this.prepend(cell));
    }

    showSelect(selectedArr){
        const cells = selectedArr[0].finalMoves
        selectedArr[1].toggleAttribute('selected', true);
        this.highlightCell(cells, selectedArr[0]);
    }

    highlightCell(arr, piece){
        arr.map(cell =>{
            //! more pawn things
            
            const atribute = cell.piece || (cell == this.getCell(this.board.inPassing) && piece.type == 'pawn' )? cell.piece?.color == piece.color? 'defend' : 'attack' : 'move';
            cell.toggleAttribute(atribute,true);
        });
    }
    clearHighlight(){
        const atributes = ['attack','defend','move'];
        atributes.map(atribute =>  Array.from(this.querySelectorAll(`[${atribute}]`))?.map(cell => cell.toggleAttribute(atribute,false)));
        // Array.from(this.querySelectorAll('[attack]'))?.map(cell => cell.toggleAttribute('attack',false));
        // Array.from(this.querySelectorAll("[move]"))?.map(cell => cell.toggleAttribute('move',false));
        this.querySelector('[selected]')?.toggleAttribute('selected',false);
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

    get columns(){
        const arr = [];
        for(let i=0 ; i < this.x ; i++)arr.push([]);
        this.grid.map(cell =>{
            arr[cell.x].push(cell);
        });
    return arr
    }

    get rows(){
        const arr = [];
        for(let i=0 ; i < this.y ; i++)arr.push([]);
        this.grid.map(cell =>{
            arr[cell.y].push(cell);
        });
    return arr
    }

    get blackPieces(){
        return Array.from(this.querySelectorAll(`[black]`));
    }
    get blackKing(){
        return this.querySelector(`[black][king]`);
    }

    get whitePieces(){
        return Array.from(this.querySelectorAll(`[white]`));
    }
    get whiteKing(){
        return this.querySelector(`[white][king]`);
    }

    get pieces(){
        return this.whitePieces.concat(this.blackPieces);
    }

    get draggableTiles(){
        //get draggable tils that have no pieces
        return Array.from(this.querySelectorAll(`[draggable='true']:not(:has(*))`));
    }



    get inCheck(){
        //returns true false if king in check
        const color = this.board.turnColor == 'w'? 'white' : 'black';
        const otherColor = color == 'white'? 'black' : 'white';
        return this[`${otherColor}Pieces`].map(piece => piece.attackcell(this[`${color}King`].cell)).includes(true);
    }

    get counterInCheckMoves(){
        //get piece(s) that attack the king
        if(this.inCheck){
            const color = this.board.turnColor == 'w'? 'white' : 'black';
            const otherColor = color == 'white'? 'black' : 'white';
            const pieces = this[`${otherColor}Pieces`].map(piece => {return piece.attackcell(this[`${color}King`].cell) && piece}).filter(n => n);
            //can only make a counter move for other pieces if there's only 1 attacker
            const piece = pieces.length == 1? pieces[0]: null;
            if(piece){
                const cells = [piece.cell];
                if(piece.type == 'rook' || piece.type == 'bishop' || piece.type == 'queen'){
                    //get the attacking row and push these
                    const moves = piece.moves.map(row => {
                        const reducedRow = piece.allowedRowMove(row);
                        return reducedRow.pop() == this[`${color}King`].cell? reducedRow : false;
                    }).flat().filter(n => n);
                    cells.push(...moves);
                }
                return cells // array of cells that !king pieces can move to 
            }
        }
        // no countermoves aveble
        return [];
    }

    getCell(x = 0,y = 0){
        if(typeof x == 'object'){
            if(x[0] >= 0 && x[0] < this.columns.length && x[1] >= 0 && x[1] < this.rows.length) return this.columns[x[0]][x[1]] ;
        } 
        else if (typeof x == 'string'){
            const rows = ['a','b','c','d','e','f','g','h'];
            y = + 7 -(x[1] -1);
            x = rows.indexOf(x[0]);
        }
        if (x >= 0 && x < this.columns.length && y >= 0 && y < this.rows.length)return this.columns[x][y];
    }

    getCells(array){
        return array.map(coord =>{
            return this.getCell(coord);
            ;
        });
    }

    get gridFen(){
        //build a fen string 	rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
        let string = '';
        this.rows.map(row =>{
            let empty = 0;
            row.map(cell => {
                if(cell.piece){
                    string += empty > 0? empty+cell.piece.letter : cell.piece.letter;
                    empty = 0;
                }else{
                    empty ++
                }
            });
            string += empty? `${empty}/` : "/";
        });
        //get rid of last / with slice
        return string.slice(0 , -1);
    }

    makeGrid(columns,rows){
        const arr = []
        for(let y = 0 ; y < rows ; y++){
            for(let x = 0; x < columns; x++){
               arr.push(new ChessTile(x,y));
            }
        }
        return arr;
    }
}
customElements.define('chess-grid', ChessGrid);

export {ChessGrid};
console.log('chess-grid.js loaded');