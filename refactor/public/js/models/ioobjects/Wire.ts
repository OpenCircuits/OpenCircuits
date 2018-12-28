import {DEFAULT_SIZE} from "../../utils/Constants";

import {Vector,V} from "../../utils/math/Vector";
import {BezierCurve} from "../../utils/math/BezierCurve";
import {IOObject}   from "./IOObject";
import {Component}  from "./Component";
import {OutputPort} from "./OutputPort";
import {InputPort}  from "./InputPort";

export class Wire extends IOObject {
    private input: OutputPort;
    private output: InputPort;

    private isOn: boolean;

    private shape: BezierCurve;
    private straight: boolean;
    private dirty: boolean;

	public constructor(input: OutputPort, output: InputPort) {
        super();

		this.input = input;
		this.output = output;

        this.isOn = false;

        this.shape = new BezierCurve(V(),V(),V(),V());
        this.straight = false;
        this.dirty = true;
	}

    private updateCurve(): void {
        if (!this.dirty)
            return;
        this.dirty = false;

        if (this.input != null) {
            var pos = this.input.getWorldTargetPos();
            var dir = this.input.getWorldDir();
            this.shape.setP1(pos);
            this.shape.setC1(dir.scale(DEFAULT_SIZE).add(pos));
        }
        if (this.output != null) {
            var pos = this.output.getWorldTargetPos();
            var dir = this.output.getWorldDir();
            this.shape.setP2(pos);
            this.shape.setC2(dir.scale(DEFAULT_SIZE).add(pos));
        }
    }

	public activate(signal: boolean): void {
		// Don't do anything if signal is same as current state
		if (signal == this.isOn)
			return;

		this.isOn = signal;
		if (this.output != null)
			this.output.activate(signal);
	}

	public setInput(c: OutputPort): void {
		this.input = c;
	}

	public setOutput(c: InputPort): void {
		this.output = c;
	}

    public getInputComponent(): Component {
        return this.input.getParent();
    }

    public getOutputComponent(): Component {
        return this.output.getParent();
    }

    public getIsOn(): boolean {
        return this.isOn;
    }

    public getShape(): BezierCurve {
        this.updateCurve();
        return this.shape;
    }

    public isStraight(): boolean {
        return this.straight;
    }

    public getDisplayName(): string {
        return "Wire";
    }
}
