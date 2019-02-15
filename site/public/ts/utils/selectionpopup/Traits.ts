import { Vector } from "../math/Vector";

export interface Positionable {
    setPos(v: Vector): void;
    getPos(): Vector;
}