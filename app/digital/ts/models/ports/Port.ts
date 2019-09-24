import {IO_PORT_LENGTH} from "digital/utils/Constants";
import {Vector,V} from "Vector";

import {Selectable} from "core/utils/Selectable";

import {Component} from "core/models/Component";
import {Wire}      from "../../../../core/ts/models/Wire";

export abstract class Port implements Selectable {
    protected parent: Component;
    protected isOn: boolean;

    protected name: string;

    protected dir: Vector;

    protected origin: Vector;
    protected target: Vector;

    protected constructor(parent: Component) {
        this.parent = parent;
        this.isOn = false;

        this.name = "";

        this.dir = this.getInitialDir();
        this.origin = V(0, 0);
        this.target = this.dir.scale(IO_PORT_LENGTH);
    }

    private updateDir(): void {
        // If target and origin are same, don't update dir
        if (this.target.sub(this.origin).len2() == 0)
            return;

        this.dir = this.target.sub(this.origin).normalize();
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setOriginPos(pos: Vector): void {
        this.origin = pos;
        this.updateDir();
    }
    public setTargetPos(pos: Vector): void {
        this.target = pos;
        this.updateDir();
    }

    public getParent(): Component {
        return this.parent;
    }
    public getIsOn(): boolean {
        return this.isOn;
    }

    public getName(): string {
        return this.name;
    }

    public abstract getInitialDir(): Vector;

    public getDir(): Vector {
        return this.dir.copy();
    }
    public getOriginPos(): Vector {
        return this.origin.copy();
    }
    public getTargetPos(): Vector {
        return this.target.copy();
    }

    public getWorldDir(): Vector {
        return this.parent.getTransform().toWorldSpace(this.dir).sub(this.parent.getPos()).normalize();
    }
    public getWorldOriginPos(): Vector {
        return this.parent.getTransform().toWorldSpace(this.origin);
    }
    public getWorldTargetPos(): Vector {
        return this.parent.getTransform().toWorldSpace(this.target);
    }

    public getPos(): Vector {
        return this.getTargetPos();
    }

    public abstract getWires(): Array<Wire>;

}
