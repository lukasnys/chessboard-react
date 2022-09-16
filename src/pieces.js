import { COLS } from "./global";

const isDiagonal = (position, newPosition) => {
    // See if difference in column is equal to difference in row
    const rowDiff = Math.abs(newPosition[1] - position[1]);
    const colDiff = Math.abs(
        COLS.indexOf(newPosition[0]) - COLS.indexOf(position[0])
    );

    return rowDiff === colDiff;
};

const isStraight = (position, newPosition) => {
    const sameRow = newPosition[1] === position[1];
    const sameCol = newPosition[0] === position[0];
    return sameRow || sameCol;
};

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

    constructor(position, isWhite) {
        this.position = position;
        this.isWhite = isWhite;
    }

    getImage() {
        return `./images/${this.isWhite ? "w" : "b"}${this.FIRST_LETTER}.png`;
    }

    getImageClassName() {
        return this.FIRST_LETTER
            ? `${this.isWhite ? "w" : "b"}${this.FIRST_LETTER}`
            : "";
    }

    isMoveLegal(pieces, newPosition) {
        return this.getLegalMoves(pieces).indexOf(newPosition) !== -1;
    }

    getLegalMoves(pieces) {
        return [];
    }

    generateMovesFromSignsArray(signs, pieces, maxDistance = 7) {
        const moves = [];
    
        const column = COLS.indexOf(this.position[0]);
        const row = +this.position[1];
    
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
    POINTS = 1;
    FIRST_LETTER = "p";

    getLegalMoves(pieces) {
        let moves = []

        const column = COLS.indexOf(this.position[0]);
        const row = +this.position[1];

        // Variables that differ depending on color of the piece
        const startingRow = this.isWhite ? 2 : 7;
        const sign = this.isWhite ? 1 : -1;

        // Single square move
        moves.push(this.position[0] + (row + (sign * 1)))
        
        // Double square move
        const isStartingSpot = row === startingRow;
        if (isStartingSpot) moves.push(this.position[0] + (row + (sign * 2)))

        // Filter out moves where a piece resides
        moves = moves.filter(move => !pieces.find(piece => piece.position === move))

        const leftCapturePosition = COLS[column - 1] + (row + (sign * 1))
        const leftCapturePiece = pieces.find(piece => piece.position === leftCapturePosition)
        if (leftCapturePiece && leftCapturePiece.isWhite !== this.isWhite) {
            moves.push(leftCapturePosition)
        }

        const rightCapturePosition = COLS[column + 1] + (row + (sign * 1))
        const rightCapturePiece = pieces.find(piece => piece.position === rightCapturePosition)
        if (rightCapturePiece && rightCapturePiece.isWhite !== this.isWhite) {
            moves.push(rightCapturePosition)
        }


        // TODO: check for en passant

        return moves;
    }
}

export class Bishop extends Piece {
    POINTS = 3;
    FIRST_LETTER = "b";
    NOTATION = "B";

    getLegalMoves(pieces) {
        const signs = this.DIAGONAL_SIGNS;        

        return this.generateMovesFromSignsArray(signs, pieces);
    }
}

export class Knight extends Piece {
    POINTS = 3;
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
    POINTS = 5;
    FIRST_LETTER = "r";
    NOTATION = "R";

    getLegalMoves(pieces) {
        const signs = this.STRAIGHT_SIGNS;

        return this.generateMovesFromSignsArray(signs, pieces);
    }
}

export class Queen extends Piece {
    POINTS = 9;
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
