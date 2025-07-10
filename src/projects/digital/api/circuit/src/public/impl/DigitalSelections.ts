import {DigitalCircuitContext, DigitalTypes} from "./DigitalCircuitContext";
import {DigitalSelections, ReadonlySimState} from "../DigitalCircuit";
import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";


export class DigitalSelectionsImpl extends SelectionsImpl<DigitalTypes> implements DigitalSelections {
    protected override readonly ctx: DigitalCircuitContext;

    public constructor(ctx: DigitalCircuitContext) {
        super(ctx);

        this.ctx = ctx;
    }

    public get simState(): ReadonlySimState {
        return this.selections.simState;
    }
}
