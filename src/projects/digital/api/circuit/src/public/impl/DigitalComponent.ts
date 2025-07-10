import {ComponentImpl} from "shared/api/circuit/public/impl/Component";
import {GUID}          from "shared/api/circuit/public";

import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";

import {DigitalCircuitContext, DigitalTypes} from "./DigitalCircuitContext";


export class DigitalComponentImpl extends ComponentImpl<DigitalTypes> implements DigitalComponent {
    protected override readonly ctx: DigitalCircuitContext;

    public constructor(ctx: DigitalCircuitContext, id: GUID, icId?: GUID) {
        super(ctx, id, icId);

        this.ctx = ctx;
    }

    public get inputs(): DigitalPort[] {
        return this.allPorts.filter((p) => (p.isInputPort));
    }
    public get outputs(): DigitalPort[] {
        return this.allPorts.filter((p) => (p.isOutputPort));
    }

    public setSimState(state: number[]): void {
        if (this.icId)
            throw new Error(`DigitalComponentImpl: Cannot set sim state for component with ID '${this.id}' in IC ${this.icId}! IC objects are immutable!`);
        this.ctx.sim.setState(this.id, state);
    }
}
