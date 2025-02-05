import {Vector} from "Vector";

import {CircleContains} from "math/MathUtils";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of a Circle shape.
 */
export class CirclePrim implements Prim {
    public readonly kind = "Circle";

    public pos: Vector;
    public radius: number;

    /**
     * Constructor for a circle primitive.
     *
     * @param pos    The position of the center of the circle.
     * @param radius The radius of the circle.
     */
    public constructor(pos: Vector, radius: number) {
        this.pos = pos;
        this.radius = radius;
    }

    public hitTest(pt: Vector): boolean {
        return CircleContains(this.pos, this.radius, pt);
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
}
