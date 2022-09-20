import { COLS } from "../global";

export default class Piece {
    DIAGONAL_SIGNS = [
        { colSign: -1, rowSign: -1 }, // North West
        { colSign: 1, rowSign: -1 }, // North East
        { colSign: 1, rowSign: 1 }, // South East
        { colSign: -1, rowSign: 1 }, // South West
    ]

    STRAIGHT_SIGNS = [
        { colSign: 0, rowSign: -1 }, // Up
        { colSign: 1, rowSign: 0 }, // Right
        { colSign: 0, rowSign: 1 }, // Down
        { colSign: -1, rowSign: 0 }, // Left
    ]

    hasMoved = false;

    constructor(position, isWhite) {
        this.position = position;
        this.isWhite = isWhite;
    }

    static clone(instance) {
        return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance);
    }

    static isInBounds(columnNumber, row) {
        return columnNumber >= 0 &&  columnNumber <= 7 && row >= 1 && row <= 8;
    }

    getPositionElements() {
        return [COLS.indexOf(this.position[0]), +this.position[1]];
    }

    getImage() {
        return `./images/${this.isWhite ? "w" : "b"}${this.FIRST_LETTER}.png`;
    }

    getImageClassName() {
        return this.FIRST_LETTER
            ? `${this.isWhite ? "w" : "b"}${this.FIRST_LETTER}`
            : "";
    }

    setPosition(position) {
        this.hasMoved = true;
        this.position = position;
        return this;
    }

    generateMovesFromSignsArray(signs, pieces, maxDistance = 7) {
        const moves = [];

        const [column, row] = this.getPositionElements();

        // Goes in a certain direction starting from the piece and sees if the square is valid
        signs.forEach(({ colSign, rowSign }) => {
            for (let i = 1; i < 1 + maxDistance; i++) {
                // Calculate the destination position
                const [destColumnNumber, destRow] = [column + (colSign * i), row + (rowSign * i)]
                
                if (!Piece.isInBounds(destColumnNumber, destRow)) break;
                
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