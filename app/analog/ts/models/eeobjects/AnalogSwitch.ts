import {serialize, serializable} from "serialeazy";

import {IO_PORT_LENGTH} from "core/utils/Constants";

import {Vector,V}     from "Vector";
import {Transform}    from "math/Transform";
import {RectContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";
import {Pressable} from "core/utils/Pressable";

import {AnalogComponent} from "../AnalogComponent";

@serializable("AnalogSwitch")
export class AnalogSwitch extends AnalogComponent implements Pressable {
    @serialize
    protected pressableBox: Transform;

    @serialize
    protected closed: boolean;

    public constructor() {
        super(new ClampedValue(2), V(50, 40));

        this.ports.getPorts()[0].setOriginPos(V(this.getSize().x/2, 0));
        this.ports.getPorts()[0].setTargetPos(V(IO_PORT_LENGTH, 0));

        this.ports.getPorts()[1].setOriginPos(V(-this.getSize().x/2, 0));
        this.ports.getPorts()[1].setTargetPos(V(-IO_PORT_LENGTH, 0));

        this.pressableBox = new Transform(V(), V(30, 30));
        this.pressableBox.setParent(this.transform);

        this.closed = false;
    }

    public click(): void {
        this.closed = !this.closed;
    }

    public press(): void {
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

    public isClosed(): boolean {
        return this.closed;
    }

    public getImageName(): string {
        return (this.closed ? "closed_switch.svg" : "open_switch.svg");
    }

    public getDisplayName(): string {
        return "Switch";
    }
}
