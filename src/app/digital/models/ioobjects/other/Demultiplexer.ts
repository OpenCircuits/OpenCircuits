import {serializable} from "serialeazy";

import {DEFAULT_SIZE, MULTIPLEXER_HEIGHT_OFFSET} from "core/utils/Constants";

import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {OutputPort} from "../../ports/OutputPort";
import {Mux} from "./Mux";

@serializable("Demultiplexer")
export class Demultiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(1), new ClampedValue(4, 2, Math.pow(2,8)),
              undefined, new ConstantSpacePositioner<OutputPort>("right", DEFAULT_SIZE));
        this.updatePortNames();
        this.setOriginPositions();
    }

    /**
     * Sets default names for the select and output ports so the user can easily
     * tell what they are used for.
     */
     private updatePortNames(): void {
        this.selects.getPorts().forEach((p, i) => {
            if (p.getName() == "") p.setName('S'+i)});
        this.outputs.getPorts().forEach((p, i) => {
            if (p.getName() == "") p.setName('O'+i)});
    }

    /**
     * Sets the selector port origin positions to be diagonally along the bottom
     * edge of the Demultiplexer.
     */
    private setOriginPositions(): void {
        const width = this.getSize().x;
        const slope = MULTIPLEXER_HEIGHT_OFFSET / width;
        const midPortOriginOffset = this.getSize().y / 2 - MULTIPLEXER_HEIGHT_OFFSET / 2;
        this.getSelectPorts().forEach((p) => {
            let pos = p.getOriginPos();
            pos.y = midPortOriginOffset + slope * pos.x;
            p.setOriginPos(pos);
        });
    }

    public activate(): void {
        const values = this.selects.getPorts().map(p => (p.getIsOn() ? 1 : 0)) as number[];

        const num = values.reduce((acc, cur, i) => acc = acc | (cur << i), 0);

        // Turn off each output port
        this.getOutputPorts().forEach((_, i) => super.activate(false, i));

        super.activate(this.inputs.last.getIsOn(), num);
    }

    public setSelectPortCount(val: number): void {
        super.setSelectPortCount(val);
        // update the input port to align with the left edge of the DeMux
        this.inputs.updatePortPositions();
        this.updatePortNames();
        this.setOriginPositions();
    }

    public getDisplayName(): string {
        return "Demultiplexer";
    }
}
