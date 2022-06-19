import {Component} from "./Component";
import {Port}      from "./ports/Port";


export interface Node extends Component {
    getP1(): Port;
    getP2(): Port;
}

export function isNode(c: unknown): c is Node {
    if (!(c instanceof Component))
        return false;
    return (c as Node).getP1 !== undefined &&
           (c as Node).getP2 !== undefined;
}
