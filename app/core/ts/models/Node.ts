import {Port} from "./ports/Port";

export interface Node {
    getP1(): Port;
    getP2(): Port;
}