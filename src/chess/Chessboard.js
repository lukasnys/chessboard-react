import { COLS, ROWS } from "../global";
import Bishop from "./Bishop";
import King from "./King";
import Knight from "./Knight";
import Pawn from "./Pawn";
import Piece from "./Piece";
import Queen from "./Queen";
import Rook from "./Rook";

export default class Chessboard {

    constructor() {
        this.pieces = Chessboard.getInitialBoard();
    }

    static moveNotationToPositions(pieces, moveNotation, moveNumber) {
        const isWhite = moveNumber % 2 === 0;
        let filteredPieces = pieces.filter(p => p.isWhite === isWhite);

        if (moveNotation.startsWith("O-O")) {
            const shortCastle = moveNotation === "O-O";
            const king = filteredPieces.find(p => p.isKing());

            const destinationColumn = shortCastle ? "g" : "c";
            const destination = destinationColumn + king.row;

            if (!king.getLegalMoves(pieces, moveNumber).includes(destination)) return;

            return [king.position, destination];
        }

        // See if there's a check or a checkmate
        const lastChar = moveNotation[moveNotation.length - 1]
        const isCheck = lastChar === "+";
        const isCheckMate = lastChar === "#";

        if (isCheck || isCheckMate) moveNotation = moveNotation.slice(0, -1);

        // Check promotion
        const isPromotion = moveNotation[moveNotation.length - 2] === "=";
        const promotionType = isPromotion ? moveNotation[moveNotation.length - 1] : "";
        if (isPromotion) moveNotation = moveNotation.slice(0, -2);

        let isCapture = false;

        // Check if it's a pawn
        let pieceType = moveNotation[0];
        if (pieceType >= "a" && pieceType <= "h") {
            pieceType = "P";

            isCapture = moveNotation[1] === "x";
            if (isCapture) {
                filteredPieces = filteredPieces.filter(p => p.column === moveNotation[0]);
                moveNotation = moveNotation.slice(2);
            }
        } else {
            moveNotation = moveNotation.slice(1);

            // e.g. Nbxc3, Nbc3, Rdb1
            // Check if additional ambiguity
            if ((COLS.includes(moveNotation[0]) && !ROWS.includes(+moveNotation[1])) || ROWS.includes(moveNotation[0])) {
                if (COLS.includes(moveNotation[0])) {
                    filteredPieces = filteredPieces.filter(p => p.column === moveNotation[0]);
                } else {
                    filteredPieces = filteredPieces.filter(p => p.row === +moveNotation[0]);
                }
                moveNotation = moveNotation.slice(1);
            }

            isCapture = moveNotation[0] === "x";
            moveNotation = moveNotation.slice(isCapture ? 1 : 0);
        }

        const destination = moveNotation;


        filteredPieces = filteredPieces.filter(p => p.NOTATION === pieceType && p.getLegalMoves(pieces, moveNumber).includes(destination));
        if (isCheck) filteredPieces = filteredPieces.filter(p => Chessboard.isInCheck(Chessboard.moveWithoutChecks(pieces, p.position, destination, moveNumber), moveNumber + 1, !isWhite));
        if (isCheckMate) filteredPieces = filteredPieces.filter(p => Chessboard.isInCheckMate(Chessboard.moveWithoutChecks(pieces, p.position, destination, moveNumber), moveNumber + 1, !isWhite));
        if (filteredPieces.length !== 1) return;

        // TODO: can this stay here or should it solve ambiguous moves?
        const isDestinationPiece = pieces.find(p => p.position === destination);
        const isEnPassant = pieceType === "P" && pieces.find(p => p.isPawn() && p.isWhite !== isWhite && p.position === destination[0] + filteredPieces[0].row);
        if (isCapture && !isDestinationPiece && !isEnPassant) return;

        return [filteredPieces[0].position, destination, promotionType];
    }

    static getMoveNotation(pieces, oldPosition, newPosition) {
        const piece = pieces.find(p => p.position === oldPosition);
        const destPiece = pieces.find(p => p.position === newPosition);

        let moveNotation = piece.NOTATION;

        // TODO: add part for ambiguous moves

        if (destPiece) {

            // If pawn captures, add column of pawn
            if (!piece.NOTATION)
                moveNotation += piece.position[0];

            moveNotation += 'x'; // captures
        }


        // TODO: castling (0-0 or 0-0-0)

        // TODO: check (+)

        // TODO: checkmate (#)

        moveNotation += newPosition;

        if (!piece.NOTATION && (+newPosition[1] === 1 || +newPosition[1] === 8)) {
            moveNotation += "Q";
        }

        return moveNotation;
    }

    static moveWithoutChecks(pieces, oldPosition, newPosition, moveNumber) {
        const piece = pieces.find(p => p.position === oldPosition);

        const horizontalOffset = COLS.indexOf(newPosition[0]) - COLS.indexOf(oldPosition[0]);
        const isMoveCastle = piece.isKing() && Math.abs(horizontalOffset) === 2;
        if (isMoveCastle) {
            const rookColumn = horizontalOffset < 0 ? "a" : "h";
            const rookDestinationColumn = horizontalOffset < 0 ? "d" : "f";

            const rookPosition = rookColumn + piece.row;
            const rookDestinationPosition = rookDestinationColumn + piece.row;

            pieces.map(p => {
                if (p.position === oldPosition) return p.setPosition(newPosition);
                if (p.position === rookPosition) return p.setPosition(rookDestinationPosition)
                return p;
            })
            return pieces;
        }

        // Remove captured piece
        const destPiece = pieces.find(p => p.position === newPosition);
        if (destPiece) pieces = pieces.filter(p => p.position !== newPosition);

        // Remove captured piece in case of en passant
        if (piece.isPawn() && !destPiece && piece.column !== newPosition[0]) {
            pieces = pieces.filter(p => p.position !== newPosition[0] + piece.row);
        }

        // Update the position of the moved piece
        return pieces.map(p => p.position === oldPosition ?
            Piece.clone(p).setPosition(newPosition, moveNumber) :
            Piece.clone(p));
    }

    static moveWithChecks(pieces, oldPosition, newPosition, moveNumber) {
        if (oldPosition === newPosition) return;

        const piece = pieces.find(p => p.position === oldPosition);
        if (!piece) return;

        const isWhiteTurn = moveNumber % 2 === 0;
        if (isWhiteTurn !== piece.isWhite) return;

        const destPiece = pieces.find(p => p.position === newPosition);
        if (destPiece && destPiece.isWhite === piece.isWhite) return;

        const legalMoves = piece.getLegalMoves(pieces, moveNumber);
        if (!legalMoves.includes(newPosition)) return;

        const piecesAfterMove = this.moveWithoutChecks(pieces, oldPosition, newPosition, moveNumber);
        if (this.isInCheck(piecesAfterMove, moveNumber + 1, piece.isWhite)) return;

        return piecesAfterMove;
    }

    static isInCheck(pieces, moveNumber, isWhite) {
        const defendingKing = pieces.find(p => p.isKing() && p.isWhite === isWhite);
        return this.canPieceBeAttacked(pieces, defendingKing, moveNumber);
    }

    static isInCheckMate(pieces, moveNumber, isWhite) {
        const isDefenderInCheck = this.isInCheck(pieces, moveNumber, isWhite);
        if (!isDefenderInCheck) return false;

        const allDefendingPieces = pieces.filter(p => p.isWhite === isWhite);
        return allDefendingPieces.every(p => p.getLegalMoves(pieces, moveNumber, false).every(move => {
            const piecesAfterMove = this.moveWithoutChecks(pieces, p.position, move, moveNumber);
            return this.isInCheck(piecesAfterMove, moveNumber + 1, isWhite);
        }))
    }

    static canPieceBeAttacked(pieces, piece, moveNumber) {
        return this.canPositionBeAttacked(pieces, piece.position, moveNumber, piece.isWhite);
    }

    static canPositionBeAttacked(pieces, position, moveNumber, isWhite) {
        const allAttackingPieces = pieces.filter(p => p.isWhite !== isWhite);
        const allAttackingLegalMoves = allAttackingPieces.flatMap(p => p.getLegalMoves(pieces, moveNumber, false));

        return allAttackingLegalMoves.includes(position);
    }

    static canPositionsBeAttacked(pieces, positions, moveNumber, isWhite) {
        const allAttackingPieces = pieces.filter(p => p.isWhite !== isWhite);
        const allAttackingLegalMoves = allAttackingPieces.flatMap(p => p.getLegalMoves(pieces, moveNumber, false));

        return positions.map(p => allAttackingLegalMoves.includes(p));
    }

    static isPromotingPiece(piece) {
        const lastRow = piece.isWhite ? 8 : 1;
        return piece.isPawn() && piece.row === lastRow;
    }

    static promotePiece(pieces, piece, chosenType) {
        const classReferenceObject = { "Q": Queen, "N": Knight, "R": Rook, "B": Bishop };
        const classReference = classReferenceObject[chosenType];

        const newPiece = new classReference(piece.position, piece.isWhite);
        newPiece.hasMoved = true;

        pieces = pieces.filter(p => p.position !== piece.position);
        pieces.push(newPiece);
        return pieces;
    }

    static getInitialBoard() {
        const pieces = [];

        // Rooks
        pieces.push(new Rook("a1", true));
        pieces.push(new Rook("h1", true));
        pieces.push(new Rook("a8", false));
        pieces.push(new Rook("h8", false));

        // Knights
        pieces.push(new Knight("b1", true));
        pieces.push(new Knight("g1", true));
        pieces.push(new Knight("b8", false));
        pieces.push(new Knight("g8", false));

        // Bishops
        pieces.push(new Bishop("c1", true));
        pieces.push(new Bishop("f1", true));
        pieces.push(new Bishop("c8", false));
        pieces.push(new Bishop("f8", false));

        // Queen
        pieces.push(new Queen("d1", true));
        pieces.push(new Queen("d8", false));

        // King
        pieces.push(new King("e1", true));
        pieces.push(new King("e8", false));

        // Pawns
        for (let i = 0; i < 8; i++) {
            pieces.push(new Pawn(COLS[i] + 2, true));
            pieces.push(new Pawn(COLS[i] + 7, false));
        }

        return pieces;
    }
}
