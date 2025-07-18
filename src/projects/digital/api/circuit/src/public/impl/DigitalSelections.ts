import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";

import {DigitalSelections} from "../DigitalCircuit";
import {ReadonlySimState}  from "../DigitalSim";

import {DigitalAPITypes, DigitalCircuitContext} from "./DigitalCircuitContext";


export class DigitalSelectionsImpl extends SelectionsImpl<DigitalAPITypes> implements DigitalSelections {
    protected override readonly ctx: DigitalCircuitContext;

    public constructor(ctx: DigitalCircuitContext) {
        super(ctx);

        this.ctx = ctx;
    }

    public get simState(): ReadonlySimState {
        return this.selections.simState;
    }
}
