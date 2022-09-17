import { COLS, POINTS } from "./global";

export class Piece {
    POINTS = -1;
    FIRST_LETTER = "";
    NOTATION = "";
    
    DIAGONAL_SIGNS = [
        { colSign: -1, rowSign: -1}, // North West
        { colSign: 1, rowSign: -1}, // North East
        { colSign: 1, rowSign: 1}, // South East
        { colSign: -1, rowSign: 1}, // South West
    ]
    
    STRAIGHT_SIGNS = [
        { colSign: 0, rowSign: -1}, // Up
        { colSign: 1, rowSign: 0}, // Right
        { colSign: 0, rowSign: 1}, // Down
        { colSign: -1, rowSign: 0}, // Left
    ]

    hasMoved = false;

    constructor(position, isWhite) {
        this.position = position;
        this.isWhite = isWhite;
    }

    static clone(instance) {
        return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance);
    }

    getImage() {
        return `./images/${this.isWhite ? "w" : "b"}${this.FIRST_LETTER}.png`;
    }

    getImageClassName() {
        return this.FIRST_LETTER
            ? `${this.isWhite ? "w" : "b"}${this.FIRST_LETTER}`
            : "";
    }

    isMoveLegal(pieces, moveNumber, newPosition) {
        return this.getLegalMoves(pieces, moveNumber).indexOf(newPosition) !== -1;
    }

    getLegalMoves(pieces) {
        return [];
    }

    setPosition(position) {
        this.hasMoved = true;
        this.position = position;
        return this;
    }

    generateMovesFromSignsArray(signs, pieces, maxDistance = 7) {
        const moves = [];
    
        const column = COLS.indexOf(this.position[0]);
        const row = +this.position[1];
    
        // Goes in a certain direction starting from the piece and sees if the square is valid
        signs.forEach(({colSign, rowSign}) => {
            for (let i = 1; i < 1 + maxDistance; i++) {
                const destColumnNumber = column + (colSign * i);
                const destRow = row + (rowSign * i);
    
                // Check bounds of 
                if (destColumnNumber < 0 || destColumnNumber > 7 || destRow < 1 || destRow > 8) break;
    
                const destPosition = COLS[destColumnNumber] + destRow;
                const piece = pieces.find(piece => piece.position === destPosition);
    
                if (piece && piece.isWhite === this.isWhite) break;
    
                moves.push(destPosition);
    
                if (piece && piece.isWhite !== this.isWhite) break;
            }
        })
    
        return moves;
    }
}

export class Pawn extends Piece {
    POINTS = POINTS.PAWN;
    FIRST_LETTER = "p";

    doubleMoveMoveNumber = 0;

    getLegalMoves(pieces, moveNumber) {
        const moves = []

        const column = COLS.indexOf(this.position[0]);
        const row = +this.position[1];

        // Calculate direction of moves depending on color of the piece
        const sign = this.isWhite ? 1 : -1;

        // Single square move
        const singleMovePosition = this.position[0] + (row + (sign * 1));
        if (!pieces.find(piece => piece.position === singleMovePosition)) {
            moves.push(this.position[0] + (row + (sign * 1)))
        }
        
        // Double square move
        const doubleMovePosition = this.position[0] + (row + (sign * 2));
        if (!this.hasMoved && !pieces.find(piece => piece.position === doubleMovePosition)) {
            moves.push(doubleMovePosition)
        }

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
            const wasDoubleMoveLastMove = enPassantPiece?.doubleMoveMoveNumber === (moveNumber - 1 )
            
            if (isEnPassantPiecePawn && isEnPassantPieceOtherColor && wasDoubleMoveLastMove) {
                moves.push(capturePosition);
            }
        })

        return moves;
    }

    setPosition(position, moveNumber) {
        const isDoubleMove = !this.hasMoved && Math.abs(+position[1] - +this.position[1]) === 2;

        const pawn = super.setPosition(position);

        if (isDoubleMove) pawn.doubleMoveMoveNumber = moveNumber;

        return pawn;
    }
}

export class Bishop extends Piece {
    POINTS = POINTS.BISHOP;
    FIRST_LETTER = "b";
    NOTATION = "B";

    getLegalMoves(pieces) {
        const signs = this.DIAGONAL_SIGNS;        

        return this.generateMovesFromSignsArray(signs, pieces);
    }
}

export class Knight extends Piece {
    POINTS = POINTS.KNIGHT;
    FIRST_LETTER = "n";
    NOTATION = "N";

    getLegalMoves(pieces) {
        let moves = [];

        const column = COLS.indexOf(this.position[0]);
        const row = +this.position[1];

        // Eight possible moves
        moves.push(COLS[column + 1] + (row - 2))
        moves.push(COLS[column + 2] + (row - 1))
        moves.push(COLS[column + 2] + (row + 1))
        moves.push(COLS[column + 1] + (row + 2))
        moves.push(COLS[column - 1] + (row + 2))
        moves.push(COLS[column - 2] + (row + 1))
        moves.push(COLS[column - 2] + (row - 1))
        moves.push(COLS[column - 1] + (row - 2))

        // Remove out of bounds positions
        moves = moves.filter(move => move && +move.slice(1) >= 1 && +move.slice(1) <= 8)

        // Remove positions where another piece of the same color resides
        moves = moves.filter(move => {
            const piece = pieces.find(piece => piece.position === move);
            const isOtherColoredPiece = piece && piece.isWhite !== this.isWhite;
            return !piece || isOtherColoredPiece;
        })

        return moves;
    }
}

export class Rook extends Piece {
    POINTS = POINTS.ROOK;
    FIRST_LETTER = "r";
    NOTATION = "R";

    getLegalMoves(pieces) {
        const signs = this.STRAIGHT_SIGNS;

        return this.generateMovesFromSignsArray(signs, pieces);
    }
}

export class Queen extends Piece {
    POINTS = POINTS.QUEEN;
    FIRST_LETTER = "q";
    NOTATION = "Q";

    getLegalMoves(pieces) {
        const signs = [...this.STRAIGHT_SIGNS, ...this.DIAGONAL_SIGNS]

        return this.generateMovesFromSignsArray(signs, pieces);
    }
}

export class King extends Piece {
    FIRST_LETTER = "k";
    NOTATION = "K";

    getLegalMoves(pieces) {
        const signs = [...this.STRAIGHT_SIGNS, ...this.DIAGONAL_SIGNS]

        return this.generateMovesFromSignsArray(signs, pieces, 1);
    }
}
