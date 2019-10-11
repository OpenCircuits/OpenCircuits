import {IO_PORT_RADIUS} from "digital/utils/Constants";

import {Vector, V} from "Vector";
import {CircleContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent} from "analog/models/AnalogComponent";
import {Node} from "core/models/Node";
import {AnalogPort} from "../ports/AnalogPort";

export class AnalogNode extends AnalogComponent implements Node {
    discriminator: "NODE_INTERFACE";

    public constructor() {
        super(new ClampedValue(1,1,1), V(2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS));

        // Set origin = target position so that they overlap and look like 1 dot
        this.ports.first.setTargetPos(this.ports.first.getOriginPos());
    }

    public isWithinSelectBounds(v: Vector): boolean {
        return CircleContains(this.getPos(), this.getSize().x, v);
    }

    public getP1(): AnalogPort {
        return this.ports.first;
    }

    public getP2(): AnalogPort {
        return this.ports.first;
    }

    public getDisplayName(): string {
        return "Port";
    }

    public getXMLName(): string {
        return "port";
    }
}
