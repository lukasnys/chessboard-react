import { useState } from 'react';
import './App.scss';
import { ROWS, COLS, POINTS } from './global'
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
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveNumber, setMoveNumber] = useState(0);

  const deselectPiece = () => {
    setSelected(null);
    setLegalMoves([]);
  }

  const selectPiece = (piece) => {
    setSelected(piece);
    setLegalMoves(piece.getLegalMoves(pieces));
  }

  const onSquareClicked = (position) => {
    // Unselect the piece if it's clicked twice
    if (selected?.position === position) {
      deselectPiece();
      return;
    }

    const piece = findPiece(position);
    
    const isPieceSameColor = piece?.isWhite === selected?.isWhite;
    const isCastle = selected?.POINTS === POINTS.KING && piece?.POINTS === POINTS.ROOK;
    
    // Select the clicked piece if no piece was selected or if another piece of the same color is clicked
    if (!selected || (isPieceSameColor && !isCastle)) {
      // Check if a piece is clicked
      if (!piece) return;

      // Check if it's the correct color's turn
      if (piece.isWhite && moveNumber % 2 !== 0) return;
      if (!piece.isWhite && moveNumber % 2 === 0) return;

      selectPiece(piece);
      return;
    }

    deselectPiece();

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
    if (!piece.isMoveLegal(pieces, newPosition, moveNumber)) return false;

    const destPiece = findPiece(newPosition);

    const isCastle = piece.POINTS === POINTS.KING && destPiece?.POINTS === POINTS.ROOK && piece.isWhite === destPiece?.isWhite;
    if (isCastle) {
      const rookColumn = COLS.indexOf(newPosition[0]);

      setPieces(current => current.map(piece => {
          const pieceClone = Piece.clone(piece);

          if (piece.position === oldPosition) {
            const kingColumn = COLS.indexOf(oldPosition[0]);
            const kingColumnOffset = rookColumn === 0 ? -2 : 2;

            pieceClone.setPosition(COLS[kingColumn + kingColumnOffset] + oldPosition[1]);
          } else if (piece.position === newPosition) {
            const rookColumnOffset = rookColumn === 0 ? 3 : -2;

            pieceClone.setPosition(COLS[rookColumn + rookColumnOffset] + oldPosition[1]);
          }

          return pieceClone;
        }))

        return true;
    }

    // Update state
    setPieces(current => {
      // Filter the captured piece if there is one
      let piecesCopy = destPiece && destPiece.isWhite !== piece.isWhite ?
        current.filter(p => p.position !== newPosition) :
        current;

      // Remove pawn in case of an en passant
      const isPiecePawn = piece.POINTS === POINTS.PAWN
      const didChangeColumn = oldPosition[0] !== newPosition[0];
      if (isPiecePawn && didChangeColumn && !destPiece)
        piecesCopy = piecesCopy.filter(p => p.position !== newPosition[0] + oldPosition[1])


      // Change the position of the moved piece
      return piecesCopy.map(p => p.position === oldPosition ?
        Piece.clone(p).setPosition(newPosition, moveNumber) :
        Piece.clone(p));
    });

    return true;
  }

  return (
    <div className="App">
      <div className="chessboard">
        {/* PIECES AND BOARD */}
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


        {/* MOVEMENT HINTS */}
        {
          legalMoves && legalMoves.map((position) =>
            <div key={position} className={`hint ${position}`}></div>
          )
        }
      </div>
    </div>
  );
}

export default App;
