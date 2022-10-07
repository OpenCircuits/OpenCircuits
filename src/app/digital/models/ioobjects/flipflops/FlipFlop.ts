import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";

import {FlipFlopPositioner} from "digital/models/ports/positioners/FlipFlopPositioner";

//
// FlipFlop is an abstract superclass for general flip flops.
//
export abstract class FlipFlop extends DigitalComponent {
    public static readonly PRE_PORT = 0;
    public static readonly CLR_PORT = 1;

    public static readonly CLK_PORT = 3;

    public static readonly Q_PORT = 0;
    public static readonly Q2_PORT = 1;

    public constructor(numInputs: number, numOutputs: number) {
        super(
            new ClampedValue(numInputs+3), new ClampedValue(2),
            V(2, 2.4),
            new FlipFlopPositioner(numOutputs), undefined,
            { state: false, clock: false, lastClock: false },
        );

        this.getOutputPort(FlipFlop.Q_PORT).setName("Q ");
        this.getOutputPort(FlipFlop.Q2_PORT).setName("Q'");

        this.getInputPort(FlipFlop.CLK_PORT).setName(">");
        this.getInputPort(FlipFlop.PRE_PORT).setName("PRE");
        this.getInputPort(FlipFlop.CLR_PORT).setName("CLR");

        // Initial state
        super.activate(false, FlipFlop.Q_PORT);
        super.activate(true, FlipFlop.Q2_PORT);
    }

    protected abstract getNextState(): boolean;

    protected up(): boolean {
        return (this.getProp("clock") as boolean) &&
              !(this.getProp("lastClock") as boolean);
    }

    public override activate(): void {
        this.setProp("lastClock", this.getProp("clock"));

        this.setProp("clock", this.inputs.get(FlipFlop.CLK_PORT).getIsOn());

        const pre = this.inputs.get(FlipFlop.PRE_PORT).getIsOn();
        const clr = this.inputs.get(FlipFlop.CLR_PORT).getIsOn();

        const state = (() => {
            // If PRE or CLR are set, then don't care about data or clock since asynchronous
            if (pre && clr) {
                // undefined, just keep same state
                return this.getProp("state") as boolean;
            } else if (pre) {
                return true;
            } else if (clr) {
                return false;
            }
            return this.getNextState();
        })();

        this.setProp("state", state);

        super.activate(state, FlipFlop.Q_PORT);
        super.activate(!state, FlipFlop.Q2_PORT);
    }
}
