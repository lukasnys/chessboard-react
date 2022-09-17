import { useState } from 'react';
import './App.scss';
import { ROWS, COLS } from './global'
import { Bishop, King, Knight, Pawn, Piece, Queen, Rook } from './pieces';

const initialiseBoard = () => {
  const pieces = [];

  // Rooks
  pieces.push(new Rook("a1", true));
  pieces.push(new Rook("h1", true));
  pieces.push(new Rook("a8", false));
  pieces.push(new Rook("h8", false));

  // Knights
  pieces.push(new Knight("b1", true));
  pieces.push(new Knight("g1", true));
  pieces.push(new Knight("b8", false));
  pieces.push(new Knight("g8", false));

  // Bishops
  pieces.push(new Bishop("c1", true));
  pieces.push(new Bishop("f1", true));
  pieces.push(new Bishop("c8", false));
  pieces.push(new Bishop("f8", false));

  // Queen
  pieces.push(new Queen("d1", true));
  pieces.push(new Queen("d8", false));

  // King
  pieces.push(new King("e1", true));
  pieces.push(new King("e8", false));

  // Pawns
  for (let i = 0; i < 8; i++) {
    pieces.push(new Pawn(COLS[i] + 2, true));
    pieces.push(new Pawn(COLS[i] + 7, false));
  }

  return pieces;
}

// TODO: to see if there's checks, view all legal moves of opponent pieces and see if that results in king square
function App() {

  const [pieces, setPieces] = useState(initialiseBoard())
  const [selected, setSelected] = useState();
  const [moveNumber, setMoveNumber] = useState(0);

  const onSquareClicked = (position) => {    
    const piece = findPiece(position);

    // Select the clicked piece
    if (!selected || (piece && selected.isWhite === piece.isWhite)) {
      // Check if a piece is clicked
      if (!piece) return;

      // Check if it's the correct color's turn
      if (piece.isWhite && moveNumber % 2 !== 0) return;
      if (!piece.isWhite && moveNumber % 2 === 0) return;

      // If the same piece is clicked twice, unselect it
      if (selected && piece.position === selected.position) {
        setSelected(null);
        return;
      }

      setSelected(piece);
      return;
    }

    setSelected(null);

    const isMoveMade = movePiece(selected.position, position)
    if (!isMoveMade) {
      return;
    }

    setMoveNumber(moveNumber + 1);
  }

  // Returns reference to the piece
  const findPiece = (position) => {
    return pieces.find((p) => p.position === position);
  }

  // Assumes the move is legal
  const getMoveNotation = (oldPosition, newPosition) => {
    const piece = findPiece(oldPosition);
    const destPiece = findPiece(newPosition);
    
    let moveNotation = piece.NOTATION;
    
    // TODO: add part for ambiguous moves
    
    if (destPiece) {
      
      // If pawn captures, add column of pawn
      if (!piece.NOTATION)
      moveNotation += piece.position[0];
      
      moveNotation += 'x'; // captures
    }
    
    
    // TODO: castling (0-0 or 0-0-0)
    
    // TODO: check (+)
    
    // TODO: checkmate (#)
    
    moveNotation += newPosition;

    if (!piece.NOTATION && (+newPosition[1] === 1 || +newPosition[1] === 8)) {
      moveNotation += "Q";
    }

    return moveNotation;
  }

  const movePiece = (oldPosition, newPosition) => {
    // Check if same position
    if (oldPosition === newPosition) return false;

    // Check move legality
    const piece = findPiece(oldPosition);
    if (!piece.isMoveLegal(pieces, newPosition)) return false;

    const destPiece = findPiece(newPosition);

    // TODO: castling
    // Update state
    setPieces(current => {
      // Filter the captured piece if there is one
      const piecesCopy = destPiece && destPiece.isWhite !== piece.isWhite ? 
        current.filter(piece => piece.position !== newPosition) : 
        current;

      // Change the position of the moved piece
      return piecesCopy.map(piece => piece.position === oldPosition ? 
        Piece.clone(piece).setPosition(newPosition) : 
        Piece.clone(piece));
    });

    return true;
  }

  return (
    <div className="App">
      <div className="chessboard">
        {ROWS.map((row, i) =>
          <div key={i} className="row">
            {COLS.map((col, j) => {
              const position = col + row;
              const piece = findPiece(position);
              return <div key={j} onClick={() => onSquareClicked(position)} className={`square ${(i + j) % 2 ? '' : 'square-dark'} ${piece ? piece.getImageClassName() : ""}`} >
                {col}{row}
              </div>
            })}
          </div>
        )}

        {
          selected != null && selected.getLegalMoves(pieces).map((position) =>
            <div key={position} className={`hint ${position}`}></div>
          )
        }
      </div>
    </div>
  );
}

export default App;
