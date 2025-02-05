import {Vector} from "Vector";

import {BezierCurve}    from "math/BezierCurve";
import {BezierContains} from "math/MathUtils";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of a Bezier Curve shape.
 *
 * See the @BezierCurve class for more details about this shape.
 */
export class BezierCurvePrim implements Prim {
    public readonly kind = "BezierCurve";

    public curve: BezierCurve;

    /**
     * Constructor for a bezier curve primitive.
     *
     * @param curve The bezier curve to represent.
     */
    public constructor(curve: BezierCurve) {
        this.curve = curve;
    }

    public hitTest(pt: Vector): boolean {
        return BezierContains(this.curve, pt);
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
}
