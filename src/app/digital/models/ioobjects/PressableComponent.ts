import {serialize} from "serialeazy";

import {Vector,V}     from "Vector";
import {Transform}    from "math/Transform";
import {RectContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";

import {Pressable} from "core/utils/Pressable";

import {DigitalComponent} from "../DigitalComponent";


export abstract class PressableComponent extends DigitalComponent implements Pressable {
    @serialize
    protected pressableBox: Transform;

    @serialize
    protected on: boolean;

    protected constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector, pSize: Vector) {
        super(inputPortCount, outputPortCount, size);

        this.pressableBox = new Transform(V(), pSize);
        this.pressableBox.setParent(this.transform);

        this.on = false;
    }

    public activate(signal: boolean, i: number = 0): void {
        this.on = signal;

        super.activate(signal, i);
    }

    public press(): void {
    }

    public click(): void {
    }

    public release(): void {
    }

    /**
     * Determines whether or not a point is within
     *  this component's "pressable" bounds
     * @param  v The point
     * @return   True if the point is within this component,
     *           false otherwise
     */
    public isWithinPressBounds(v: Vector): boolean {
        return RectContains(this.pressableBox, v);
    }

    public isWithinSelectBounds(v: Vector): boolean {
        // Only true if we're normally in bounds and also not in the press bounds
        //   i.e. prevents selecting when pressing the button part of the Button
        return super.isWithinSelectBounds(v) && !this.isWithinPressBounds(v);
    }

    public getPressableBox(): Transform {
        return this.pressableBox;
    }

    public isOn(): boolean {
        return this.on;
    }

    public getMinPos(): Vector {
        const min = super.getMinPos();
        // Find minimum pos from corners of selection box
        const corners = this.pressableBox.getCorners().map((v) =>
            v.sub(this.getOffset())
        );
        return Vector.min(min, ...corners);
    }

    public getMaxPos(): Vector {
        const max = super.getMaxPos();
        // Find maximum pos from corners of selection box
        const corners = this.pressableBox.getCorners().map((v) =>
            v.add(this.getOffset())
        );
        return Vector.max(max, ...corners);
    }

    public getImageName(): string {
        return (this.isOn() ? this.getOnImageName() : this.getOffImageName());
    }

    public abstract getOffImageName(): string;
    public abstract getOnImageName(): string;

}
