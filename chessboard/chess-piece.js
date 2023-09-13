/*
    only need basic rules?
    rook moves on x or y axis
    knight  moves 1 x or y then 1 diagnol
    bishop  moves on diagnol axis
    queen   rook + bishop

    need special rules
    king    moves 1 anny direction
    pawn    moves 1 forward and atacks 1 diagnaly forward and has a potential move of 2 forward at startposition

    <chess-piece type= pawn  team = black></chesspiece>
*/

import { importCss } from "../functions.js";


class ChessPiece extends HTMLElement{
    constructor(letter){
        super()
        if(letter){
            const team = letter == letter.toUpperCase()? 'white' : 'black';
            const type = this.pieceTypes[letter.toLowerCase()];
            type && this.toggleAttribute(type , true);
            team && this.toggleAttribute(team, true);
            //make img
            const img = document.createElement('img');
            img.src = `./svg/${team}-${type}.svg`;
            img.width = 80;
            img.height = 80;
            this.append(img);
        }
    }

    connectedCallback(){
        importCss('chess-piece.css');
        this.cell && this.cell.setDragable();
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

    get cell(){
        //to prefent a inf loop when a piece is not on the board
        return this.parentElement.nodeName == 'CHESS-TILE'? this.closestElement("chess-tile"): false;
    }

    get x(){
        return this.cell.x;
    }

    get y(){
        return this.cell.y;
    }

    get letter(){
        if(this.type == 'knight')return this.color == 'white'? 'N' : 'n';
        return this.color == 'white'? this.type.charAt(0).toUpperCase() : this.type.charAt(0).toLowerCase() ;
    }

    get type(){
        return [...this.attributes].map(atibute =>{
            if(atibute.name == 'knight')return this.pieceTypes['n'];
            else if(this.pieceTypes[atibute.name.charAt(0)] == atibute.name)return atibute.name
        }).filter(n => n)[0];
    }

    get color(){
        return [...this.attributes].map(atibute =>{
            if(this.teams.includes(atibute.name)) return atibute.name;
        }).filter(n => n)[0];
    }
    get team(){
        return this.color;
    }
    get otherColor(){
       return this.color == 'black'? 'white' : 'black';
    }

    get pieceTypes(){
        return {'r':'rook','n':'knight','b':'bishop','q':'queen','k':'king','p':'pawn'};
    }

    get teams(){
        return ['black','white'];
    }

    get defendingKing(){
        //returns cells if moving this 
       const dir = this.grid[`${this.color}King`].queenMoves.map(dir => {return dir.includes(this.cell)? dir : ''}).filter(n => n)[0]
       if(dir?.length > 0){
            //check friendlys
            return dir.map(cell =>{return cell.piece?.color == this.color && cell != this.cell? true : false}).some(x => x == true)? false :
            //check enemy that could attack king
             dir.map(cell =>{return cell.piece?.color == this.otherColor && (cell.piece?.type == 'rook' || cell.piece?.type == 'bishop'|| cell.piece?.type == 'queen') && cell.piece?.moves.flat().includes(this.grid[`${this.color}King`].cell) ? true : false;}).some(x => x == true)? dir : false;
       }else return false
    }

    get finalMoves(){
        //reduces allowedmoves if its defending the king
        return this.defendingKing? this.grid.inCheck? [] :  this.allowedMoves.map(cell => {return this.defendingKing.includes(cell)? cell : ''}).filter(n =>n): this.grid.inCheck? this.counterMoves : this.allowedMoves;
    }

    get counterMoves(){
       return this.type != 'king'? this.allowedMoves.map(cell => {return this.grid.counterInCheckMoves.includes(cell)? cell : ''}).filter(n =>n): this.allowedMoves;
    }


    get moves(){
        // look at type and give back its moves
        return this[this.type+'Moves'];
    }

    get allowedMoves(){
        //looks at the moves and check ec dont go over pieces cant move in a direction that alowes the king to be taken
        if(this.type == 'rook' || this.type == 'bishop' || this.type == 'queen'){
            // reduced the rows till a piece and flat to make 1 array witt cells
           return this.moves.map(row => this.allowedRowMove(row)).flat();
        }
        else if(this.type == 'knight'){
            //of the board is already done
            return this.moves
        }
        else if(this.type == 'pawn'){
            return this.moves
        }
        else if(this.type == 'king'){
            //we move the king of board then see if the tiles are attackble put king back and return the alowed moves
            const moves = this.moves;
            const cell = this.cell;
            const grid = this.grid;
            this.board.append(this);
            const allowedMoves = moves.map(cell => {
                if(cell.piece?.color == this.color) return ''
                else{
                  return !grid[this.otherColor+'Pieces'].map(piece => piece.attackcell(cell)).includes(true) && cell
                }
            }).filter(n => n);
            cell.append(this);
            return allowedMoves;
        }
    }
    

    allowedRowMove(row){
        //stop the row if encounter a piece then look if its fomr other player
        let stop = 0
        return row.map(cell =>{
            if(stop == 0 && cell.piece){
                stop++
                //add cell if the blocker is a enemy
              return    cell
            } 
            return stop == 0? cell :  '';
        }).filter(n => n);
    }

    get rookMoves(){
        // make 4 arrays 1 for each direction so later can break the array if it found a block
        const arr = [];

        let a = [];
        // <
        for(let x = this.cell.x -1; x >= 0; x--){
            a.push(this.grid.getCell(x, this.cell.y));
        }
        a.length > 0 && arr.push(a);
        
        a = [];
        // >
        for(let x = this.cell.x +1; x < this.grid.x; x++){
            a.push(this.grid.getCell(x, this.cell.y));
        }
        a.length > 0 && arr.push(a);

        a = [];
        // ^
        for(let y = this.cell.y -1; y >= 0 ; y--){
            a.push(this.grid.getCell(this.cell.x,y));
        }
        a.length > 0 && arr.push(a);

        a = [];
        // down
        for(let y = this.cell.y +1; y < this.grid.y; y++){
            a.push(this.grid.getCell(this.cell.x, y));
        }
        a.length > 0 && arr.push(a);

        return arr;
    }

    get bishopMoves(){
            // make 4 arrays 1 for each direction so later can break the array if it found a block
            const arr = [];

            let [a,x,y] = [[],this.cell.x +1,this.cell.y -1];
            // top right
            while(x < this.grid.x && y >= 0 ){
                a.push(this.grid.getCell(x,y));
                x ++;
                y--;
            }
            a.length > 0 && arr.push(a);

            [a,x,y] = [[],this.cell.x +1,this.cell.y +1];
            // bottom right
            while(x < this.grid.x && y < this.grid.y ){
                a.push(this.grid.getCell(x,y));
                x ++;
                y++;
            }
            a.length > 0 && arr.push(a);
            
            [a,x,y] = [[],this.cell.x -1,this.cell.y +1];
            // bottom left
            while(x >= 0 && y < this.grid.y ){
                a.push(this.grid.getCell(x,y));
                x --;
                y++;
            }
            a.length > 0 && arr.push(a);

            [a,x,y] = [[],this.cell.x -1,this.cell.y -1];
            // bottom right
            while(x >= 0 && y >= 0 ){
                a.push(this.grid.getCell(x,y));
                x--;
                y--;
            }
            a.length > 0 && arr.push(a);


        return arr;
    }

    get queenMoves(){
        return this.rookMoves.concat(this.bishopMoves);
    }

    get knightMoves(){
        const moves = [[this.x-2,this.y-1],[this.x -2, this.y+1],[this.x -1, this.y-2],[this.x -1, this.y+2],[this.x +1, this.y-2],[this.x +1, this.y+2],[this.x +2,this.y-1],[this.x +2,this.y+1]];
        return this.grid.getCells(moves.map(coord =>{
            if((coord[0] >= 0 && coord[0] < this.grid.columns.length )&&(coord[1] >= 0 && coord[1] < this.grid.rows.length))return coord ;
        }).filter(n => n));
    }

    get pawnMoves(){
        const dir = this.color == 'white'? this.y - 1 : this.y + 1;
        const moves = this.grid.getCell(this.x, dir).piece == null? [this.grid.getCell(this.x, dir)] : [];
        //startmoves
        this.color == 'black' && this.y == 1 && moves.length > 0 && !this.grid.getCell(this.x, dir+1).piece && moves.push(this.grid.getCell(this.x , dir +1));
        this.color == 'white' && this.y == 6 && moves.length > 0 && !this.grid.getCell(this.x, dir-1).piece && moves.push(this.grid.getCell(this.x , dir -1));
        // attack moves
        this.pawnAttackMoves.map(cell =>{
           (cell.piece || cell == this.grid.getCell(this.board.inPassing)) &&  moves.push(cell);
        });
        return moves;
    }
    get pawnAttackMoves(){
        const dir = this.color == 'white'? this.y - 1 : this.y + 1;
        return [this.grid.getCell(this.x -1,dir),this.grid.getCell(this.x + 1,dir)].filter(n => n)
    }

    get kingMoves(){
        const moves = this.queenMoves.map(array => array[0]).filter(n => n);
        //Castling is permitted only if neither the king nor the rook has previously moved; the squares between the king and the rook are vacant; and the king does not leave, cross over, or finish on a square attacked by an enemy piece.
        // add castling moves
        this.color == 'white'? 'uppercase' : 'lowercase';
        //queenSide
        if(this.board.castlingFen.includes(this.color == 'white'? 'Q' : 'q')){
            const cells = this.grid.getCells([[this.x -1,this.y],[this.x-2,this.y]]);
            cells.map(cell => {
               return !cell.piece && !this.grid[this.otherColor+'Pieces'].map(piece => piece.attackcell(cell)).includes(true)
            }).every(x => x == true) && this.grid.getCell([this.x-3,this.y]).piece == null && moves.push(cells[1]);
        }
        //kingSide
        if(this.board.castlingFen.includes(this.color == 'white'? 'K' : 'k')){
            const cells = this.grid.getCells([[this.x +1,this.y],[this.x+2,this.y]]);
            cells.map(cell => {
               return !cell.piece && !this.grid[this.otherColor+'Pieces'].map(piece => piece.attackcell(cell)).includes(true)
            }).every(x => x == true) && moves.push(cells[1]);
        }

        return moves
    }
    get kingAttackMoves(){
        return this.queenMoves.map(array => array[0]).filter(n => n)
    }

    attackcell(cell,king = false){
        // return true if it can attack the cell
        if(this.type == 'pawn')return this.pawnAttackMoves.includes(cell)
        else if(this.type == 'king')return this.kingAttackMoves.includes(cell)
        else return this.allowedMoves.includes(cell) 
    }
    
}
customElements.define('chess-piece', ChessPiece);

export {ChessPiece}
console.log('chess-piece.js loaded');