import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {Positioner} from "core/models/ports/positioners/Positioner"

import {DigitalComponent} from "digital/models/DigitalComponent";

import {InputPort} from "digital/models/ports/InputPort";

//
// Latch is an abstract superclass for general latches.
//
export abstract class Latch extends DigitalComponent {
    public static readonly E_PORT = 1;

    public static readonly Q_PORT = 0;
    public static readonly Q2_PORT = 1;

    protected constructor(numInputs: number, inputPositioner?: Positioner<InputPort>) {
        super(
            new ClampedValue(numInputs+1), new ClampedValue(2),
            V(1.4, 1.4),
            inputPositioner, undefined,
            { enabled: false, state: false },
        );

        this.getOutputPort(Latch.Q_PORT).setName("Q ");
        this.getOutputPort(Latch.Q2_PORT).setName("Q'");

        this.getInputPort(Latch.E_PORT).setName("E");

        // Initial state
        super.activate(false, Latch.Q_PORT);
        super.activate(true, Latch.Q2_PORT);
    }

    protected abstract getNextState(): boolean;

    public override activate(): void {
        this.setProp("enabled", this.inputs.get(Latch.E_PORT).getIsOn());

        if (this.getProp("enabled"))
            this.setProp("state", this.getNextState());

        const state = this.getProp("state") as boolean;
        super.activate(state , Latch.Q_PORT);
        super.activate(!state, Latch.Q2_PORT);
    }

}
