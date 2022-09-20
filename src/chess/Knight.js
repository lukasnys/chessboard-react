import { POINTS, COLS } from "../global"
import Piece from "./Piece";

export default class Knight extends Piece {
    POINTS = POINTS.KNIGHT;
    FIRST_LETTER = "n";
    NOTATION = "N";

    MOVE_OFFSETS = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];

    getLegalMoves(pieces) {
        const moves = [];
        const [column, row] = this.getPositionElements();

        this.MOVE_OFFSETS.forEach(([columnOffset, rowOffset]) => {
            const [destColumnNumber, destRow] = [column + columnOffset, row + rowOffset]
            
            // Check if the move is in bounds
            if (!Piece.isInBounds(destColumnNumber, destRow)) return;
            
            const destPosition = COLS[destColumnNumber] + destRow;

            // Check if there's a same colored piece on the destination position
            const destPiece = pieces.find(piece => piece.position === destPosition);
            if (destPiece?.isWhite === this.isWhite) return;

            moves.push(destPosition);
        });

        return moves;
    }
}