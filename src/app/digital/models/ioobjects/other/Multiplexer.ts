import {serializable} from "serialeazy";

import {DEFAULT_SIZE, MULTIPLEXER_HEIGHT_OFFSET} from "core/utils/Constants";

import {ClampedValue} from "math/ClampedValue";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {InputPort} from "../../ports/InputPort";
import {Mux} from "./Mux";

@serializable("Multiplexer")
export class Multiplexer extends Mux {

    public constructor() {
        super(new ClampedValue(4, 2, Math.pow(2,8)), new ClampedValue(1),
              new ConstantSpacePositioner<InputPort>("left", DEFAULT_SIZE));
        this.updatePortNames();
        this.setOriginPositions();
    }

    /**
     * Sets default names for the select and input ports so the user can easily
     * tell what they are used for.
     */
     private updatePortNames(): void {
        this.selects.getPorts().forEach((p, i) => {
            if (p.getName() == "") p.setName('S'+i)});
        this.inputs.getPorts().forEach((p, i) => {
            if (p.getName() == "") p.setName('I'+i)});
    }

    /**
     * Sets the selector port origin positions to be diagonally along the bottom
     * edge of the Multiplexer.
     */
    private setOriginPositions(): void {
        const width = this.getSize().x;
        const slope = MULTIPLEXER_HEIGHT_OFFSET / width; // give the 7 a name somewhere in Constants.ts
        const midPortOriginOffset = this.getSize().y / 2 - MULTIPLEXER_HEIGHT_OFFSET / 2;
        this.getSelectPorts().forEach((p) => {
            let pos = p.getOriginPos();
            pos.y = midPortOriginOffset - slope * pos.x;
            p.setOriginPos(pos);
        });
        // TODO move y origin coordinate for input ports up by default_size/2
        // move selector ports up default_size/2
        // make a little smaller so there isn't so much extra space at the top
    }

    /**
     * Activate function that allows the multiplexer
     * 	to give desired output
     */
    public activate(): void {
        let num = 0;
        for (let i = 0; i < this.selects.length; i++)
            num = num | ((this.selects.get(i).getIsOn() ? 1 : 0) << i);
        super.activate(this.inputs.get(num).getIsOn());
    }

    public setSelectPortCount(val: number): void {
        super.setSelectPortCount(val);
        // update the output port to align with the right edge of the Mux
        this.outputs.updatePortPositions();
        this.updatePortNames();
        this.setOriginPositions();
    }

    public getDisplayName(): string {
        return "Multiplexer";
    }
}
