import {IO_PORT_LENGTH} from "../../utils/Constants";
import {Vector,V} from "../../utils/math/Vector";

import {Component} from "./Component";

export abstract class Port {
    protected parent: Component;
    protected isOn: boolean;

	protected origin: Vector;
	protected target: Vector;

    protected constructor(parent: Component, dir: Vector) {
        this.parent = parent;
		this.isOn = false;

		this.origin = V(0, 0);
		this.target = dir.scale(IO_PORT_LENGTH);
    }

    public setOriginPos(pos: Vector): void {
        this.origin = pos;
    }
    public setTargetPos(pos: Vector): void {
        this.target = pos;
    }

	public getParent(): Component {
		return this.parent;
	}
	public getIsOn(): boolean {
		return this.isOn;
	}
	public getOriginPos(): Vector {
		return this.origin;
	}
	public getTargetPos(): Vector {
		return this.target;
	}
}
