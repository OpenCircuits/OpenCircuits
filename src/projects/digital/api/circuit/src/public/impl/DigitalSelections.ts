import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {DigitalSelections, ReadonlySimState} from "../DigitalCircuit";
import {SelectionsImpl} from "shared/api/circuit/public/impl/Selections";


export class DigitalSelectionsImpl extends SelectionsImpl<DigitalTypes> implements DigitalSelections {
    protected override readonly state: DigitalCircuitState;

    public constructor(state: DigitalCircuitState) {
        super(state);

        this.state = state;
    }

    public get simState(): ReadonlySimState {
        return this.selections.simState;
    }
}
