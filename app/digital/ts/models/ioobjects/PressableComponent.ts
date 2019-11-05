import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {Vector,V}     from "Vector";
import {Transform}    from "math/Transform";
import {RectContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";

import {XMLNode} from "core/utils/io/xml/XMLNode";
import {Pressable} from "core/utils/Pressable";

import {DigitalComponent} from "../DigitalComponent";

export abstract class PressableComponent extends DigitalComponent implements Pressable {
    protected pressableBox: Transform;
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
        let min = super.getMinPos();

        // Find minimum pos from corners of selection box
        this.pressableBox.getCorners().forEach((v) => {
            v = v.sub(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH));
            min = Vector.min(min, v);
        });
        return min;
    }

    public getMaxPos(): Vector {
        let max = super.getMaxPos();
        // Find minimum pos from corners of selection box
        this.pressableBox.getCorners().forEach((v) => {
            v = v.add(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH));
            max = Vector.max(max, v);
        });
        return max;
    }

    public copy(): PressableComponent {
        const copy = <PressableComponent>super.copy();
        copy.pressableBox = this.pressableBox.copy();
        copy.pressableBox.setParent(copy.transform);
        copy.activate(this.isOn());
        return copy;
    }

    public save(node: XMLNode): void {
        super.save(node);

        node.addAttribute("isOn", this.isOn());
    }

    public load(node: XMLNode): void {
        super.load(node);

        this.activate(node.getBooleanAttribute("isOn"));
    }

    public getImageName(): string {
        return (this.isOn() ? this.getOnImageName() : this.getOffImageName());
    }

    public abstract getOffImageName(): string;
    public abstract getOnImageName(): string;

}
