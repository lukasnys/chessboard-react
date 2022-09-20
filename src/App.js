import { useEffect, useState } from 'react';
import './App.scss';
import Piece from './chess/Piece';
import Bishop from './chess/Bishop';
import Knight from './chess/Knight';
import Queen from './chess/Queen';
import Rook from './chess/Rook';
import { ROWS, COLS, POINTS } from './global'
import Chessboard from './chess/Chessboard';

function App() {

  const [pieces, setPieces] = useState(Chessboard.getInitialBoard())
  const [selected, setSelected] = useState();
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveNumber, setMoveNumber] = useState(0);

  const [positionAfterPromotion, setPositionAfterPromotion] = useState();
  const [promotingPiece, setPromotingPiece] = useState();

  useEffect(() => {
    const didWhiteMove = moveNumber % 2 === 1;

    const isCheckMate = Chessboard.isInCheckMate(pieces, moveNumber, !didWhiteMove);

    if (isCheckMate) gameWon(didWhiteMove);
  }, [pieces]);

  const gameWon = (isWhite) => {
    console.log(`${isWhite ? "White" : "Black"} won!`);
    deselectPiece();
    setMoveNumber(0);
    setPieces(Chessboard.getInitialBoard());
  }

  const selectPiece = (piece) => {
    const pseudoLegalMoves = piece.getLegalMoves(pieces, moveNumber);
    
    const legalMoves = pseudoLegalMoves.filter(move => {
      const piecesCopy = pieces.map(p => Piece.clone(p));
      const piecesWithMoveDone = Chessboard.moveWithoutChecks(piecesCopy, piece.position, move, moveNumber);
      return !Chessboard.isInCheck(piecesWithMoveDone, moveNumber + 1, piece.isWhite);
    })
    
    setSelected(piece);
    setLegalMoves(legalMoves);
  }

  const deselectPiece = () => {
    setSelected(null);
    setLegalMoves([]);
  }

  const onSquareClicked = (position) => {
    if (selected?.position === position) {
      deselectPiece();
      return;
    }

    if (promotingPiece) {
      setPromotingPiece(null);
      setPositionAfterPromotion("");
      return;
    }

    const piece = pieces.find(p => p.position === position);
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

    setPieces(current => {
      try {
        const piecesAfterMove = Chessboard.moveWithChecks(current, selected.position, position, moveNumber);
        deselectPiece();
        setMoveNumber(moveNumber + 1);
        return piecesAfterMove;
      } catch (e) {
        return current;
      }
    });

    // const isPromoting = selected.POINTS === POINTS.PAWN && +newPosition[1] === (selected.isWhite ? 8 : 1);
    // if (isPromoting) {
    //   setPromotingPiece(selected);
    //   setPositionAfterPromotion(newPosition);
    //   deselectPiece();
    //   return false;
    // }
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

  return (
    <div className="App">
      <div className="chessboard">
        {/* PIECES AND BOARD */}
        {ROWS.map((row, i) =>
          <div key={i} className="row">
            {COLS.map((col, j) => {
              const position = col + row;
              const piece = pieces.find(p => p.position === position);
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
