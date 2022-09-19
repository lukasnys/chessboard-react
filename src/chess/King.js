import { POINTS } from "../global"
import Piece from "./Piece";

export default class King extends Piece {
    POINTS = POINTS.KING;
    FIRST_LETTER = "k";
    NOTATION = "K";

    getLegalMoves(pieces, _moveNumber, includeCastling = true) {
        const signs = [...this.STRAIGHT_SIGNS, ...this.DIAGONAL_SIGNS]

        const moves = this.generateMovesFromSignsArray(signs, pieces, 1);

        // Castling is not necessary in some situations
        if (!includeCastling) return moves;

        if (this.hasMoved) return moves;

        const castleVariables = [{ rookColumn: "a", piecesColumns: ["b", "c", "d"] }, { rookColumn: "h", piecesColumns: ["f", "g"] }];

        castleVariables.forEach(({ rookColumn, piecesColumns }) => {
            const castlePosition = rookColumn + this.position[1];
            const castleRook = pieces.find(piece => piece.POINTS === POINTS.ROOK && piece.isWhite === this.isWhite && piece.position === castlePosition);
            if (!castleRook || castleRook.hasMoved) return;

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
}