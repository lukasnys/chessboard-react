import { POINTS, COLS } from "../global"
import Piece from "./Piece";

export default class King extends Piece {
    POINTS = POINTS.KING;
    FIRST_LETTER = "k";
    NOTATION = "K";

    // R . x . K . x R
    // 
    // . . K R . . . R
    // OR
    // R . . . . R K .
    getCastlingMoves(pieces, moveNumber) {
        if (this.hasMoved) return [];

        const moves = [];

        const castleVariables = [{ moveColumn: "c", rookColumn: "a" }, { moveColumn: "g", rookColumn: "h" }];
        castleVariables.forEach(({ moveColumn, rookColumn }) => {
            // Check if the rook is there and hasn't moved
            const rookPosition = rookColumn + this.row;
            const rook = pieces.find(p => p.position === rookPosition && p.POINTS === POINTS.ROOK && p.isWhite === this.isWhite);
            if (!rook || rook.hasMoved) return;

            const columnStart = Math.min(rook.columnNumber, this.columnNumber);
            const columnEnd = Math.max(rook.columnNumber, this.columnNumber);
            const positionsBetween = COLS.slice(columnStart + 1, columnEnd).map(col => col + this.row);
            
            // Check if all positions between the king and the rook are empty
            const piecesBetween = pieces.filter(p => positionsBetween.includes(p.position));
            if (!piecesBetween.every(piece => !piece)) return;

            // Check if the king passes through or ends up in check
            const checkForCheckColumns = COLS.slice(columnStart + 1, columnEnd).slice(-2);
            const checkForCheckPositions = checkForCheckColumns.map(col => col + this.position[1]);

            const allOtherColoredLegalMoves = pieces.filter(p => p.isWhite !== this.isWhite).flatMap(p => p.getLegalMoves(pieces, moveNumber + 1, false));
            if (!allOtherColoredLegalMoves.every(possiblePosition => !checkForCheckPositions.includes(possiblePosition))) return;

            moves.push(moveColumn + this.row);
        })

        return moves;
    }

    getLegalMoves(pieces, moveNumber, includeCastling = true) {
        const signs = [...this.STRAIGHT_SIGNS, ...this.DIAGONAL_SIGNS]

        const moves = this.generateMovesFromSignsArray(signs, pieces, 1);

        // Castling is not necessary in some situations
        if (includeCastling) moves.push(...this.getCastlingMoves(pieces, moveNumber));

        return moves;
    }
}