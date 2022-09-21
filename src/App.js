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

  const showGameAutomatically = (moves) => {
    const timeoutId = setTimeout(() => {
      if (!moves[moveNumber] || moves[moveNumber] === "1-0" || moves[moveNumber === "0-1"]) { 
        console.log(moveNumber);
        clearTimeout(timeoutId);
        return;
      }

      const result = Chessboard.moveNotationToPositions(pieces, moves[moveNumber], moveNumber);
      if (!result) {
        console.log(moveNumber, moves[moveNumber])
        clearTimeout(timeoutId);
        return;
      }

      const [oldPosition, newPosition, promotionType] = result
      
      setPieces(current => {
        const piecesAfterMove = Chessboard.moveWithChecks(current, oldPosition, newPosition, moveNumber);
        if (!piecesAfterMove) return current;

        setMoveNumber(moveNumber + 1);

        // TODO: fix promotion so pawn isn't left
        if (promotionType) {
          const piece = piecesAfterMove.find(p => p.position === newPosition);
          return Chessboard.promotePiece(pieces, piece, promotionType);
        }
        
        return piecesAfterMove;
      })
    }, 1000);
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
    setPieces(current => Chessboard.promotePiece(current, promotingPiece, selectedType.toUpperCase()));

    setMoveNumber(moveNumber + 1);
    setPromotingPiece(null);
    setPiecesBeforePromotion([]);
  }

  // Uncomment to automatically play a match
  // const moves = ["d4", "Nf6", "Nf3", "d5", "g3", "e6", "Bg2", "Be7", "O-O", "O-O", "b3", "c5", "dxc5", "Bxc5", "c4", "dxc4", "Qc2", "Qe7", "Nbd2", "Nc6", "Nxc4", "b5", "Nce5", "Nb4", "Qb2", "Bb7"];
  // moves.push("a3", "Nc6", "Nd3", "Bb6", "Bg5", "Rfd8", "Bxf6", "gxf6", "Rac1", "Nd4", "Nxd4", "Bxd4", "Qa2", "Bxg2", "Kxg2", "Qb7+", "Kg1", "Qe4", "Qc2", "a5", "Rfd1", "Kg7", "Rd2", "Rac8");
  // moves.push("Qxc8", "Rxc8", "Rxc8", "Qd5", "b4", "a4", "e3", "Be5", "h4", "h5", "Kh2", "Bb2", "Rc5", "Qd6", "Rd1", "Bxa3", "Rxb5", "Qd7", "Rc5", "e5", "Rc2", "Qd5", "Rdd2", "Qb3", "Ra2", "e4");
  // moves.push("Nc5", "Qxb4", "Nxe4", "Qb3", "Rac2", "Bf8", "Nc5", "Qb5", "Nd3", "a3", "Nf4", "Qa5", "Ra2", "Bb4", "Rd3", "Kh6", "Rd1", "Qa4", "Rda1", "Bd6", "Kg1", "Qb3");
  // const moves = ["f4", "g5", "fxg5", "f5", "gxf6", "Bg7", "fxg7", "h5", "gxh8=N"];
  // showGameAutomatically(moves);

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
