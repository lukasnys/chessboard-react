import { COLS } from "../global";
import Bishop from "./Bishop";
import King from "./King";
import Knight from "./Knight";
import Pawn from "./Pawn";
import Queen from "./Queen";
import Rook from "./Rook";

export default class Chessboard {
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
