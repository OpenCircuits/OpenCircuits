import {DEFAULT_BORDER_WIDTH} from "../../utils/Constants";

import {Vector,V}     from "../../utils/math/Vector";
import {Transform}    from "../../utils/math/Transform";
import {ClampedValue} from "../../utils/ClampedValue";

import {XMLNode} from "../../utils/io/xml/XMLNode";

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

	public getMinPos(): Vector {
		let min = super.getMinPos();

		// Find minimum pos from corners of selection box
		this.selectionBox.getCorners().forEach((v) => {
			v = v.sub(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH));
			min = Vector.min(min, v);
		});
		return min;
	}

	public getMaxPos(): Vector {
		let max = super.getMaxPos();
		// Find minimum pos from corners of selection box
		this.selectionBox.getCorners().forEach((v) => {
			v = v.add(V(DEFAULT_BORDER_WIDTH, DEFAULT_BORDER_WIDTH));
			max = Vector.max(max, v);
		});
		return max;
	}

    public save(node: XMLNode): void {
        super.save(node);

        node.addAttribute("isOn", this.isOn());
    }

    public load(node: XMLNode): void {
        super.load(node);

        this.activate(node.getBooleanAttribute("isOn"));
    }

	public getImageName(): string {
		return (this.isOn ? this.getOnImageName() : this.getOffImageName());
	}

	public abstract getOffImageName(): string;
	public abstract getOnImageName(): string;

}
