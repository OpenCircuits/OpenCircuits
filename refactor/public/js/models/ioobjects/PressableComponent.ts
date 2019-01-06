import {Vector,V}     from "../../utils/math/Vector";
import {Transform}    from "../../utils/math/Transform";
import {ClampedValue} from "../../utils/ClampedValue";

import {Component} from "./Component";

export abstract class PressableComponent extends Component {
	protected selectionBox: Transform;
	protected on: boolean;

	protected constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue, size: Vector, sSize: Vector) {
		super(inputPortCount, outputPortCount, size);

		this.selectionBox = new Transform(V(), sSize);
		this.selectionBox.setParent(this.transform);
	}

	public activate(signal: boolean, i: number = 0): void {
        this.on = signal;

		super.activate(signal, i);
	}

	public press(): void {
	}

	public click(): void {
	}

	public release(): void {
	}

	public getSelectionBox(): Transform {
		return this.selectionBox;
	}

	public isOn(): boolean {
		return this.on;
	}

	public abstract getOnImageName(): string;

}
