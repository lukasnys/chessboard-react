import { POINTS } from "../global"
import Piece from "./Piece";

export default class Queen extends Piece {
    POINTS = POINTS.QUEEN;
    FIRST_LETTER = "q";
    NOTATION = "Q";

    getLegalMoves(pieces) {
        const signs = [...this.STRAIGHT_SIGNS, ...this.DIAGONAL_SIGNS]

        return this.generateMovesFromSignsArray(signs, pieces);
    }
}