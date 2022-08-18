# schaakzet.github.io

Roads Technology SchaakZet project

---
### Repository
[schaakzet.github.io](https://github.com/schaakzet/schaakzet.github.io)

---

### Documentation
- [Forsyth–Edwards Notation (FEN)](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)
- [Algebraic Notation](https://en.wikipedia.org/wiki/Algebraic_notation_(chess))

---

### Tools
- [Mermaid Diagrams](https://mermaid-js.github.io) -- Used for drawing the diagrams in the readme file.
- [SourceTree](https://www.sourcetreeapp.com) -- Used for interaction with git.
- [npm](https://docs.npmjs.com) -- Used for package (dependency) management.
- [CSpell](https://cspell.org) -- Used for spelling check on code.
- [ESLint](https://eslint.org) -- Used for javascript code analysis.

---

### Data Store

```mermaid
erDiagram
      MATCH ||--o{ MATCHMOVE : one-to-many
      MATCH {
            string id
      }
      MATCHMOVE {
            int id
            string match_id
            string move
            string fen
      }
```

---
### Web Components

#### ``<chess-board>``

```mermaid
classDiagram
      class ChessBoard {
            array capturedBlackPieces
            array capturedWhitePieces
            array chessMoves
            bool  doingCastling
      }

      chessboard <|-- ChessBoard
      chessboard: +String id
      chessboard: +Boolean record = record moves in chess_match database
      chessboard: +String fen
```