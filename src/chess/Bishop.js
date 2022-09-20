import { POINTS } from "../global"
import Piece from "./Piece";

export default class Bishop extends Piece {
    POINTS = POINTS.BISHOP;
    FIRST_LETTER = "b";
    NOTATION = "B";

    getLegalMoves(pieces) {
        const signs = this.DIAGONAL_SIGNS;
        return this.generateMovesFromSignsArray(signs, pieces);
    }
}