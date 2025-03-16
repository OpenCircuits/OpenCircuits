import {ComponentImpl} from "shared/api/circuit/public/impl/Component";

import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";

import {DigitalCircuitState, DigitalTypes} from "./DigitalCircuitState";
import {Signal} from "../../internal/sim/Signal";
import {GUID} from "shared/api/circuit/public";


export class DigitalComponentImpl extends ComponentImpl<DigitalTypes> implements DigitalComponent {
    protected override readonly state: DigitalCircuitState;

    public constructor(state: DigitalCircuitState, id: GUID) {
        super(state, id);

        this.state = state;
    }

    public get inputs(): DigitalPort[] {
        return this.allPorts.filter((p) => (p.isInputPort));
    }
    public get outputs(): DigitalPort[] {
        return this.allPorts.filter((p) => (p.isOutputPort));
    }

    public setSimState(state: Signal[]): void {
        this.state.sim.setState(this.id, state);
    }
}
