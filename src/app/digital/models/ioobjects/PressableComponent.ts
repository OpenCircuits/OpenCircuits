import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";
import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {Pressable} from "core/utils/Pressable";

import {DigitalComponent} from "../index";


export abstract class PressableComponent extends DigitalComponent implements Pressable {
    protected pressTransform: Transform;

    protected constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector, pSize: Vector) {
        super(inputPortCount, outputPortCount, size, undefined, undefined, { pSize });

        this.pressTransform = new Transform(V(), pSize);
        this.pressTransform.setParent(this.transform);
    }

    public press(): void {}

    public click(): void {}

    public release(): void {}

    /**
     * Determines whether or not a point is within
     *  this component's "pressable" bounds.
     *
     * @param v The point.
     * @returns   True if the point is within this component,
     *    false otherwise.
     */
    public isWithinPressBounds(v: Vector): boolean {
        return RectContains(this.getPressableBox(), v);
    }

    public override isWithinSelectBounds(v: Vector): boolean {
        // Only true if we're normally in bounds and also not in the press bounds
        //   i.e. prevents selecting when pressing the button part of the Button
        return super.isWithinSelectBounds(v) && !this.isWithinPressBounds(v);
    }

    public getPressableBox(): Transform {
        if (this.dirtyTransform) // Update transform
            super.getTransform();
        return this.pressTransform;
    }

    public override getMinPos(): Vector {
        const min = super.getMinPos();
        // Find minimum pos from corners of selection box
        const corners = this.getPressableBox().getCorners().map((v) =>
            v.sub(this.getOffset())
        );
        return Vector.Min(min, ...corners);
    }

    public override getMaxPos(): Vector {
        const max = super.getMaxPos();
        // Find maximum pos from corners of selection box
        const corners = this.getPressableBox().getCorners().map((v) =>
            v.add(this.getOffset())
        );
        return Vector.Max(max, ...corners);
    }
}
