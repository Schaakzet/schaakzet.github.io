# CHESS-PIECE

## methods

attributeChangedCallback
movePieceTo
isPiece
sameColorAsPiece
potentialMoves
potentialKingMoves
animateTo
animateFinished

## properties

is
pieceName
fen_at
color
isWhite
isBlack
isPawn
isWhitePawn
isBlackPawn
isRook
isKnight
isBishop
isKing
isQueen
atStartRow
isPawnAtEnd
pieceMoves

# CHESS-SQUARE

## methods

handleFirstClick
handleSecondClick
connectedCallback
squareElement
addPiece
addAttribute
getAttributeArray
attackedBy
defendedBy
isDefendedBy
movesFrom
translate
highlight
clear
clearAttributes
capturePieceBy
rankDistance
isMovesFrom

## properties

piece
attackers
isAttacked
isDefended
defenders
movers
pieceName

# CHESS-BOARD

## methods

connectedCallback
attributeChangedCallback
queryBoard
createboard
setMessage
getSquare
hasSquare
getPiece
addPiece
clearAttributes
clear
restart
initPlayerTurn
changePlayer
recordMoveInDatabase
movePiece
calculateBoard
undoMove
findPieceSquare
kingSquare
kingAttackers
documentation
play
adddplaymove
save2localStorage

## properties

id
database_id
disabled
fen
record
player

# CHESS-BOARD-ANALYSIS

## methods

promotion
castling
analyzeWholeBoard
initAnalysis
enPassantPosition
reduceCastlingArray
isValidGameBoard
isInCheck
findSquaresBetween
negatingCheck
checkMate
staleMate
gameOver
