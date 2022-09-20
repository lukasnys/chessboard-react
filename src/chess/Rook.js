import { POINTS } from "../global"
import Piece from "./Piece";

export default class Rook extends Piece {
    POINTS = POINTS.ROOK;
    FIRST_LETTER = "r";
    NOTATION = "R";

    getLegalMoves(pieces) {
        const signs = this.STRAIGHT_SIGNS;
        return this.generateMovesFromSignsArray(signs, pieces);
    }
}