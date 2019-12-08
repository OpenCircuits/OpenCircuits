import {IO_PORT_LENGTH, IO_PORT_SELECT_RADIUS} from "core/utils/Constants";
import {Vector, V} from "Vector";

import {Selectable} from "core/utils/Selectable";

import {Component} from "core/models/Component";
import {Wire}      from "core/models/Wire";
import {CircleContains} from "math/MathUtils";

export abstract class Port implements Selectable {
    protected parent: Component;
    protected isOn: boolean;

    protected name: string;

    protected dir: Vector;

    protected origin: Vector;
    protected target: Vector;

    protected connections: Wire[];

    protected constructor(parent: Component, dir?: Vector) {
        this.parent = parent;
        this.isOn = false;

        this.name = "";

        this.dir = dir || this.getInitialDir();
        this.origin = V(0, 0);
        this.target = this.dir.scale(IO_PORT_LENGTH);

        this.connections = [];
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

    public abstract connect(w: Wire): void;
    public abstract disconnect(w: Wire): void;

    public isWithinSelectBounds(v: Vector): boolean {
        return CircleContains(this.getWorldTargetPos(), IO_PORT_SELECT_RADIUS, v);
    }

    // Finds index of this port in the parent
    public getIndex(): number {
        return this.parent.getPorts().indexOf(this);
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

    public getWires(): Wire[] {
        return this.connections;
    }
}
