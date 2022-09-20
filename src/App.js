import { useEffect, useState } from 'react';
import './App.scss';
import Piece from './chess/Piece';
import Bishop from './chess/Bishop';
import King  from './chess/King';
import Knight from './chess/Knight';
import Pawn from './chess/Pawn';
import Queen from './chess/Queen';
import Rook from './chess/Rook';
import { ROWS, COLS, POINTS } from './global'

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

function App() {

  const [pieces, setPieces] = useState(initialiseBoard())
  const [selected, setSelected] = useState();
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveNumber, setMoveNumber] = useState(0);

  const [positionAfterPromotion, setPositionAfterPromotion] = useState();
  const [promotingPiece, setPromotingPiece] = useState();

  useEffect(() => {
    const isWhiteAttacking = moveNumber % 2 !== 0;

    const allDefendingPieces = pieces.filter(p => p.isWhite !== isWhiteAttacking);

    // In case of a check, see if checkmate
    const isDefenderInCheck = isColorInCheck(pieces, moveNumber, !isWhiteAttacking);
    if (isDefenderInCheck) {
      const isCheckMate = allDefendingPieces.every(p => p.getLegalMoves(pieces, moveNumber, false).every(move => {
        // Do the move and check if that solves check
        const piecesCopyWithMoveDone = doTestMove(p.position, move);
        return isColorInCheck(piecesCopyWithMoveDone, moveNumber + 1, !isWhiteAttacking);
      }))

      if (isCheckMate) gameWon(isWhiteAttacking);
    }
  }, [pieces]);

  const gameWon = (isWhite) => {
    console.log(`${isWhite ? "White" : "Black"} won!`);
    deselectPiece();
    setMoveNumber(0);
    setPieces(initialiseBoard());
  }

  const selectPiece = (piece) => {
    setSelected(piece);

    let legalMoves = piece.getLegalMoves(pieces, moveNumber);

    // Filter out moves that result in checks
    legalMoves = legalMoves.filter(move => {
      const piecesCopyWithMoveDone = doTestMove(piece.position, move);
      return !isColorInCheck(piecesCopyWithMoveDone, moveNumber + 1, piece.isWhite);
    })

    setLegalMoves(legalMoves);
  }

  const deselectPiece = () => {
    setSelected(null);
    setLegalMoves([]);
  }

  const doTestMove = (oldPosition, newPosition) => {
    let piecesCopy = pieces.map(p => Piece.clone(p));

    // Filter out destination piece if any
    piecesCopy = piecesCopy.filter(p => p.position !== newPosition);

    // Move piece
    const piece = piecesCopy.find(p => p.position === oldPosition);
    piece.position = newPosition;

    return piecesCopy;
  }

  const isColorInCheck = (pieces, moveNumber, isWhite) => {
    const allAttackingPieces = pieces.filter(p => p.isWhite !== isWhite);
    const allAttackingLegalMoves = allAttackingPieces.flatMap(p => p.getLegalMoves(pieces, moveNumber, false));

    const defendingKing = pieces.find(p => p.POINTS === POINTS.KING && p.isWhite === isWhite);

    return allAttackingLegalMoves.includes(defendingKing.position);
  }

  const onSquareClicked = (position) => {
    // Unselect the piece if it's clicked twice
    if (selected?.position === position) {
      deselectPiece();
      return;
    }

    if (promotingPiece) {
      setPromotingPiece(null);
      setPositionAfterPromotion("");
      return;
    }

    const piece = findPiece(position);

    const isPieceSameColor = piece?.isWhite === selected?.isWhite;

    // Select the clicked piece if no piece was selected or if another piece of the same color is clicked
    if (!selected || isPieceSameColor) {
      // Check if a piece is clicked
      if (!piece) return;

      // Check if it's the correct color's turn
      if (piece.isWhite && moveNumber % 2 !== 0) return;
      if (!piece.isWhite && moveNumber % 2 === 0) return;

      selectPiece(piece);
      return;
    }

    const isMoveMade = moveSelectedPiece(position)
    if (!isMoveMade) {
      return;
    }

    deselectPiece();
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

  const promotePiece = (selectedType) => {
    const classReferenceObject = {"q": Queen, "n": Knight, "r": Rook, "b": Bishop};
    const classReference = classReferenceObject[selectedType];

    const piece = new classReference(positionAfterPromotion, promotingPiece.isWhite);
    piece.hasMoved = true;
    
    setPieces(current => {
      current = current.filter(p => p.position !== positionAfterPromotion && p.position !== promotingPiece.position);
      current.push(piece);
      return current;
    })

    setMoveNumber(moveNumber + 1);
    setPositionAfterPromotion("");
    setPromotingPiece(null);
  }

  const moveSelectedPiece = (newPosition) => {
    const oldPosition = selected.position;

    // Check if same position
    if (oldPosition === newPosition) return false;

    // Check move legality
    if (!legalMoves.includes(newPosition)) return;

    const destPiece = findPiece(newPosition);


    const horizontalOffset = COLS.indexOf(newPosition[0]) - selected.columnNumber;
    const isCastle = selected.POINTS === POINTS.KING && Math.abs(horizontalOffset) === 2;
    if (isCastle) {
      const rookColumn = Math.sign(horizontalOffset) === -1  ? "a" : "h";
      const rook = pieces.find(p => p.position === (rookColumn + selected.row));

      setPieces(current => current.map(piece => {
        const pieceClone = Piece.clone(piece);

        if (piece.position === selected.position) {
          pieceClone.setPosition(newPosition);
        } else if (piece.position === rook.position) {
          const destRookColumn = rookColumn === "a" ? "d" : "f";

          pieceClone.setPosition(destRookColumn + selected.row);
        }

        return pieceClone;
      }))

      return true;
    }

    const isPromoting = selected.POINTS === POINTS.PAWN && +newPosition[1] === (selected.isWhite ? 8 : 1);
    if (isPromoting) {
      setPromotingPiece(selected);
      setPositionAfterPromotion(newPosition);
      deselectPiece();
      return false;
    }

    // Update state
    setPieces(current => {
      // Filter the captured piece if there is one
      let piecesCopy = destPiece && destPiece.isWhite !== selected.isWhite ?
        current.filter(p => p.position !== newPosition) :
        current;

      // Remove pawn in case of an en passant
      const isPiecePawn = selected.POINTS === POINTS.PAWN
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

        {/* PROMOTION WINDOW */}
        {
          promotingPiece && 
          <div className="promotion-window" style={{ flexDirection: promotingPiece.isWhite ? 'column-reverse' : 'column' ,transform: `translate(${COLS.indexOf(positionAfterPromotion[0]) * 100}%, ${promotingPiece.isWhite ? 100 : 0}%)`}}>
            {['q', 'n', 'r', 'b'].map(p => 
              <div key={p} onClick={() => promotePiece(p)} className={`${promotingPiece.isWhite ? "w" : "b"}${p}`}></div>
          )}
          </div>
        }
      </div>
    </div>
  );
}

export default App;
