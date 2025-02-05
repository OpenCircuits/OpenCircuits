import {Vector} from "Vector";

import {Transform} from "math/Transform";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of a Rectangle shape.
 */
export class RectanglePrim implements Prim {
    public readonly kind = "Rectangle";

    // TODO[model_refactor](leon) - need to move away from Transforms representing rectangles and having sizes
    public transform: Transform;

    /**
     * Constructor for a rectangle primitive.
     *
     * @param transform The transform that represents the rectangle.
     */
    public constructor(transform: Transform) {
        this.transform = transform;
    }

    public hitTest(pt: Vector): boolean {
        throw new Error("Method not implemented.");
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
}
