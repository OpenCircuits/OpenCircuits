import {GUID}     from "shared/api/circuit/internal";
import {PortImpl} from "shared/api/circuit/public/impl/Port";

import {Signal} from "digital/api/circuit/schema/Signal";

import {DigitalPort} from "../DigitalPort";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";


export class DigitalPortImpl extends PortImpl<DigitalTypes> implements DigitalPort {
    protected override readonly state: DigitalCircuitState;

    public constructor(state: DigitalCircuitState, id: GUID, icId?: GUID) {
        super(state, id, icId);

        this.state = state;
    }

    protected override getWireKind(_p1: GUID, _p2: GUID): string {
        return "DigitalWire";
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
        return this.state.sim.getSignal(this.id);
    }
}
