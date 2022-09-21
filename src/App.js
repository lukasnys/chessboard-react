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

  const [promotingPiece, setPromotingPiece] = useState();
  const [piecesBeforePromotion, setPiecesBeforePromotion] = useState();

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

  const cancelPromotion = () => {
    setPieces(piecesBeforePromotion);
    setPromotingPiece(null);
    setPiecesBeforePromotion([]);
  }

  const onSquareClicked = (position) => {
    if (promotingPiece) return cancelPromotion();
    if (selected?.position === position) return deselectPiece();

    const piece = pieces.find(p => p.position === position);
    if (!selected || piece?.isWhite === selected?.isWhite) {
      if (!piece) return;
      if (piece.isWhite === !!(moveNumber % 2)) return;

      selectPiece(piece);
      return;
    }

    setPieces(current => {
        const piecesAfterMove = Chessboard.moveWithChecks(current, selected.position, position, moveNumber);
        if (!piecesAfterMove) return current;
        
        deselectPiece();
              
        // Check if a piece is promoting
        const movedPiece = piecesAfterMove.find(p => p.position === position);
        if (Chessboard.isPromotingPiece(movedPiece)) {
          setPromotingPiece(movedPiece);
          setPiecesBeforePromotion(current);
          return piecesAfterMove;
        }

        setMoveNumber(moveNumber + 1);
        return piecesAfterMove;
    });
  }

  const promotePiece = (selectedType) => {
    setPieces(current => Chessboard.promotePiece(current, promotingPiece, selectedType));

    setMoveNumber(moveNumber + 1);
    setPromotingPiece(null);
    setPiecesBeforePromotion([]);
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
          <div className="promotion-window" style={{ flexDirection: promotingPiece.isWhite ? 'column-reverse' : 'column' ,transform: `translate(${COLS.indexOf(promotingPiece.position[0]) * 100}%, ${promotingPiece.isWhite ? 100 : 0}%)`}}>
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
