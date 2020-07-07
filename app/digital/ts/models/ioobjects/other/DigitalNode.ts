import {serializable} from "serialeazy";

import {IO_PORT_RADIUS} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {CircleContains} from "math/MathUtils";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/index";

import {Node} from "core/models/Node";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";

@serializable("DigitalNode")
export class DigitalNode extends DigitalComponent implements Node {

    public constructor() {
        super(new ClampedValue(1,1,1), new ClampedValue(1,1,1), V(2*IO_PORT_RADIUS, 2*IO_PORT_RADIUS));

        // Set origin = target position so that they overlap and look like 1 dot
        this.inputs.first.setOriginPos(V(0, 0));
        this.outputs.first.setOriginPos(V(0, 0));
        this.inputs.first.setTargetPos(this.inputs.first.getOriginPos());
        this.outputs.first.setTargetPos(this.outputs.first.getOriginPos());
    }

    // @Override
    public activate(): void {
        super.activate(this.inputs.first.getIsOn());
    }

    public isWithinSelectBounds(v: Vector): boolean {
        return CircleContains(this.getPos(), this.getSize().x, v);
    }

    public getP1(): InputPort {
        return this.inputs.first;
    }

    public getP2(): OutputPort {
        return this.outputs.first;
    }

    public getInputDir(): Vector {
        return this.transform.getMatrix().mul(V(-1, 0)).sub(this.getPos()).normalize();
    }

    public getOutputDir(): Vector {
        return this.transform.getMatrix().mul(V( 1, 0)).sub(this.getPos()).normalize();
    }

    public getDisplayName(): string {
        return "Port";
    }
}
