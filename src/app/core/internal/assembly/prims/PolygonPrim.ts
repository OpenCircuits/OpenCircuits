import {Vector} from "Vector";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of a Polygon shape.
 */
export class PolygonPrim implements Prim {
    public readonly kind = "Polygon";

    public points: Vector[];

    /**
     * Constructor for Polygon.
     *
     * @param points The list of vertices for the polygon.
     */
    public constructor(points: Vector[]) {
        this.points = points;
    }

    public hitTest(pt: Vector): boolean {
        throw new Error("Method not implemented.");
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
}
