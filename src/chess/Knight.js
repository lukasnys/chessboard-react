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

        // Eight possible moves
        this.MOVE_OFFSETS.forEach(([columnOffset, rowOffset]) => {
            const [destColumnNumber, destRow] = [column + columnOffset, row + rowOffset]
            const destPosition = COLS[destColumnNumber] + destRow;

            if (!Piece.isInBounds(destPosition)) return;

            const destPiece = pieces.find(piece => piece.position === destPosition);
            if (destPiece?.isWhite === this.isWhite) return;

            moves.push(destPosition);
        });

        return moves;
    }
}