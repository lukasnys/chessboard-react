import { POINTS } from "../global"
import Piece from "./Piece";

export default class King extends Piece {
    POINTS = POINTS.KING;
    FIRST_LETTER = "k";
    NOTATION = "K";

    getCastlingMoves(pieces) {
        const moves = [];

        if (this.hasMoved) return moves;

        const castleVariables = [{ rookColumn: "a", piecesColumns: ["b", "c", "d"] }, { rookColumn: "h", piecesColumns: ["f", "g"] }];

        castleVariables.forEach(({ rookColumn, piecesColumns }) => {
            // Check if the rook is there and hasn't moved
            const castlePosition = rookColumn + this.position[1];
            const castleRook = pieces.find(p => p.position === castlePosition && p.POINTS === POINTS.ROOK && p.isWhite === this.isWhite);
            if (!castleRook || castleRook.hasMoved) return;

            // Check that all spaces between the rook and king are empty
            const piecesBetween = piecesColumns.map(col => col + this.position[1]).map(position => pieces.find(piece => piece.position === position));
            if (!piecesBetween.every(piece => !piece)) return;

            // Check if king passes through any checks
            const checkForCheckColumns = [piecesColumns.pop(), piecesColumns.pop(), this.position[0]];
            const checkForCheckPositions = checkForCheckColumns.map(col => col + this.position[1]);

            const allOtherColoredPieces = pieces.filter(p => p.isWhite !== this.isWhite);
            const allOtherColoredLegalMoves = allOtherColoredPieces.flatMap(p => p.getLegalMoves(pieces));

            if (!allOtherColoredLegalMoves.every(possiblePosition => !checkForCheckPositions.includes(possiblePosition))) return;

            moves.push(castlePosition);
        })

        return moves;
    }

    getLegalMoves(pieces, _moveNumber, includeCastling = true) {
        const signs = [...this.STRAIGHT_SIGNS, ...this.DIAGONAL_SIGNS]

        const moves = this.generateMovesFromSignsArray(signs, pieces, 1);

        // Castling is not necessary in some situations
        if (includeCastling) moves.push(...this.getCastlingMoves(pieces));

        return moves;
    }
}