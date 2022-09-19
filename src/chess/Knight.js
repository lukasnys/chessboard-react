import { POINTS, COLS } from "../global"
import Piece from "./Piece";

export default class Knight extends Piece {
    POINTS = POINTS.KNIGHT;
    FIRST_LETTER = "n";
    NOTATION = "N";

    getLegalMoves(pieces) {
        const moves = [];

        const column = COLS.indexOf(this.position[0]);
        const row = +this.position[1];

        // Eight possible moves
        const offsets = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
        offsets.forEach(([columnOffset, rowOffset]) => {
            const destColumnNumber = column + columnOffset;
            const destRow = row + rowOffset;

            if (!Piece.isInBounds(destColumnNumber + destRow)) return;

            const destPosition = COLS[destColumnNumber] + destRow;
            const destPiece = pieces.find(piece => piece.position === destPosition);
            if (destPiece?.isWhite === this.isWhite) return;

            moves.push(destPosition);
        });

        return moves;
    }
}