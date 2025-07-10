import {GUID}     from "shared/api/circuit/internal";
import {PortImpl} from "shared/api/circuit/public/impl/Port";

import {Signal} from "digital/api/circuit/schema/Signal";

import {DigitalPort} from "../DigitalPort";

import {DigitalCircuitContext, DigitalTypes} from "./DigitalCircuitContext";


export class DigitalPortImpl extends PortImpl<DigitalTypes> implements DigitalPort {
    protected override readonly ctx: DigitalCircuitContext;

    public constructor(ctx: DigitalCircuitContext, id: GUID, icId?: GUID) {
        super(ctx, id, icId);

        this.ctx = ctx;
    }

    public get isInputPort(): boolean {
        return this.parent.info.inputPortGroups.includes(this.group);
    }
    public get isOutputPort(): boolean {
        return this.parent.info.outputPortGroups.includes(this.group);
    }

    public get signal(): Signal {
        if (this.icId)
            throw new Error(`DigitalPortImpl: Signal cannot be accessed for ports inside an IC! Port ID: '${this.id}', IC ID: '${this.icId}'`);
        return this.ctx.sim.getSignal(this.id);
    }
}
