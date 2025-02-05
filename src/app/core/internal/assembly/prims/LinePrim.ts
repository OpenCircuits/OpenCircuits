import {Vector} from "Vector";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of a Line shape.
 */
export class LinePrim implements Prim {
    public readonly kind = "Line";

    public readonly p1: Vector;
    public readonly p2: Vector;

    /**
     * Cosntructor for a line primitive.
     *
     * @param p1 The first point of the line.
     * @param p2 The second point of the line.
     */
    public constructor(p1: Vector, p2: Vector) {
        this.p1 = p1;
        this.p2 = p2;
    }

    public hitTest(pt: Vector): boolean {
        // TODO[.](*): Maybe allow lines to be hit ? (would require thickness to be specified? or act like bezier)
        return false;
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
}
