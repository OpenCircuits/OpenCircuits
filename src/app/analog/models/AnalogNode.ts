import {serializable} from "serialeazy";

import {IO_PORT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {ClampedValue}   from "math/ClampedValue";
import {CircleContains} from "math/MathUtils";

import {Node} from "core/models/Node";

import {AnalogComponent, AnalogPort} from "./index";


@serializable("AnalogNode")
export class AnalogNode extends AnalogComponent implements Node {

    public constructor() {
        super(new ClampedValue(2), V(2*IO_PORT_RADIUS));

        // Set origin = target position so that they overlap and look like 1 dot
        this.ports.first.setOriginPos(V(0, 0));
        this.ports.first.setTargetPos(V(0, 0));
        this.ports.last .setOriginPos(V(0, 0));
        this.ports.last .setTargetPos(V(0, 0));
    }

    public override isWithinSelectBounds(v: Vector): boolean {
        return CircleContains(this.getPos(), this.getSize().x, v);
    }

    public getP1(): AnalogPort {
        return this.ports.first;
    }

    public getP2(): AnalogPort {
        return this.ports.last;
    }

    public getDisplayName(): string {
        return "Port";
    }
}
