import {Port} from "./ports/Port";
import {Component} from "./Component";

export interface Node {
    discriminator: "NODE_INTERFACE";
    getP1(): Port;
    getP2(): Port;
}

export function isNode(obj: any): obj is Node {
    return obj.discriminator === "NODE_INTERFACE";
}