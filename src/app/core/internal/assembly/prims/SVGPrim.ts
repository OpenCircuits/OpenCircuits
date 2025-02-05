import {Vector} from "Vector";

import {Transform} from "math/Transform";
import {RectContains} from "math/MathUtils";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of a SVG shape.
 *
 * Note: currently the contents of the SVG are ignored for hit-testings and culling.
 * Instead, it is treated as a rectangle around the bounds of the SVG.
 */
export class SVGPrim implements Prim {
    public readonly kind = "SVG";

    protected size: Vector;
    protected transform: Transform;

    /**
     * Constructor for a SVG primitive.
     *
     * @param size      The size of the SVG, also dictates the bounds of the hit-testing for this SVG.
     * @param transform The transform for this SVG, note that the size of the transform is ignored.
     */
    public constructor(size: Vector, transform: Transform) {
        this.size = size;
        this.transform = transform;
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
    public hitTest(pt: Vector): boolean {
        return RectContains(this.transform, pt);
    }
}
