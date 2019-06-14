import {IO_PORT_RADIUS} from "../../../utils/Constants";

import {CircleContains} from "../../../utils/math/MathUtils";

import {Vector,V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class WirePort extends Component {

    public constructor() {
        super(new ClampedValue(1,1,1), new ClampedValue(1,1,1), V(2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS));

        // Set origin = target position so that they overlap and look like 1 dot
        this.inputs.first.setTargetPos(this.inputs.first.getOriginPos());
        this.outputs.first.setTargetPos(this.outputs.first.getOriginPos());
    }

    // @Override
    public activate() {
        super.activate(this.inputs.first.getIsOn());
    }

    public isWithinSelectBounds(v: Vector): boolean {
        return CircleContains(this.getPos(), this.getSize().x, v);
    }

    public getInputDir(): Vector {
        return this.transform.getMatrix().mul(V(-1, 0)).sub(this.getPos()).normalize();
    }

    public getOutputDir(): Vector {
        return this.transform.getMatrix().mul(V( 1, 0)).sub(this.getPos()).normalize();
    }

    public getDisplayName() {
        return "Port";
    }

    public getXMLName(): string {
        return "port";
    }
}
