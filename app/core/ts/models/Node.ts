import {Port} from "./ports/Port";
import {Component} from "./Component";

export interface Node extends Component {
    getP1(): Port;
    getP2(): Port;
}