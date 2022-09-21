import { POINTS, COLS } from "../global"
import Piece from "./Piece";

export default class Pawn extends Piece {
    POINTS = POINTS.PAWN;
    FIRST_LETTER = "p";
    NOTATION = "P";

    doubleMoveMoveNumber = 0;

    getLegalMoves(pieces, moveNumber) {
        const moves = []

        const column = COLS.indexOf(this.position[0]);
        const row = +this.position[1];

        // Calculate direction of moves depending on color of the piece
        const sign = this.isWhite ? 1 : -1;

        // Captures and passants
        ([-1, 1]).forEach(columnSign => {
            const capturePosition = COLS[column + columnSign] + (row + (sign * 1))
            const capturePiece = pieces.find(piece => piece.position === capturePosition)
            if (capturePiece && capturePiece.isWhite !== this.isWhite) {
                moves.push(capturePosition)
            }

            const enPassantPosition = COLS[column + columnSign] + row;
            const enPassantPiece = pieces.find(piece => piece.position === enPassantPosition);

            const isEnPassantPiecePawn = enPassantPiece?.POINTS === POINTS.PAWN;
            const isEnPassantPieceOtherColor = enPassantPiece?.isWhite !== this.isWhite;
            const wasDoubleMoveLastMove = enPassantPiece?.doubleMoveMoveNumber === (moveNumber - 1)

            if (isEnPassantPiecePawn && isEnPassantPieceOtherColor && wasDoubleMoveLastMove) {
                moves.push(capturePosition);
            }
        })

        // Single square move
        const singleMovePosition = this.position[0] + (row + (sign * 1));
        if (pieces.find(piece => piece.position === singleMovePosition)) return moves;
            
        moves.push(this.position[0] + (row + (sign * 1)));

        // Double square move
        const doubleMovePosition = this.position[0] + (row + (sign * 2));
        if (!this.hasMoved && !pieces.find(piece => piece.position === doubleMovePosition)) {
            moves.push(doubleMovePosition)
        }

        return moves;
    }

    setPosition(position, moveNumber) {
        const isDoubleMove = !this.hasMoved && Math.abs(+position[1] - +this.position[1]) === 2;

        const pawn = super.setPosition(position);

        if (isDoubleMove) pawn.doubleMoveMoveNumber = moveNumber;

        return pawn;
    }
}