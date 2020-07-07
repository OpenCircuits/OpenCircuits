import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serialize} from "serialeazy";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {InputPort} from "digital/models/ports/InputPort";
import {DigitalComponent} from "digital/models/DigitalComponent";

//
// FlipFlop is an abstract superclass for general flip flops.
//
export abstract class FlipFlop extends DigitalComponent {
    public static readonly PRE_PORT = 0;
    public static readonly CLR_PORT = 1;

    public static readonly CLK_PORT = 3;

    public static readonly Q_PORT = 0;
    public static readonly Q2_PORT = 1;

    @serialize
    protected clock: boolean = false;

    @serialize
    protected state: boolean = false;

    @serialize
    protected lastClock: boolean = false;

    public constructor(numInputs: number, size: Vector, inputPositioner?: Positioner<InputPort>) {
        super(new ClampedValue(numInputs+3), new ClampedValue(2), size, inputPositioner);

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
        return this.clock && !this.lastClock;
    }

    public activate(): void {
        this.lastClock = this.clock;

        this.clock = this.inputs.get(FlipFlop.CLK_PORT).getIsOn();

        const pre = this.inputs.get(FlipFlop.PRE_PORT).getIsOn();
        const clr = this.inputs.get(FlipFlop.CLR_PORT).getIsOn();

        // If PRE or CLR are set, then don't care about data or clock since asynchronous
        if (pre && clr) {
            // undefined
        } else if (pre) {
            this.state = true;
        } else if (clr) {
            this.state = false;
        } else {
            this.state = this.getNextState();
        }

        super.activate(this.state, FlipFlop.Q_PORT);
        super.activate(!this.state, FlipFlop.Q2_PORT);
    }
}
