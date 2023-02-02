import {V, Vector} from "Vector";

import {FromConcatenatedEntries} from "core/utils/Functions";

import {Schema} from "core/schema";

import {Component} from "../Component";
import {Port}      from "../Port";

import {BaseObjectImpl} from "./BaseObject";
import {CircuitState}   from "./CircuitState";


export abstract class ComponentImpl<
    State extends CircuitState = CircuitState
> extends BaseObjectImpl<State> implements Component {
    public readonly baseKind = "Component";

    protected getObj(): Schema.Component {
        const obj = this.internal.getCompByID(this.id);
        if (!obj)
            throw new Error(`API Component: Attempted to get component with ID ${this.id} could not find it!`);
        return obj;
    }

    public abstract get info(): ReturnType<State["constructComponent"]>["info"];

    public set x(val: number) {
        this.internal.setPropFor(this.id, "x", val);
    }
    public get x(): number {
        return (this.getObj().props.x ?? 0);
    }
    public set y(val: number) {
        this.internal.setPropFor(this.id, "y", val);
    }
    public get y(): number {
        return (this.getObj().props.y ?? 0);
    }

    public set pos(val: Vector) {
        this.internal.setPropFor<Schema.Component, "x">(this.id, "x", val.x);
        this.internal.setPropFor<Schema.Component, "y">(this.id, "y", val.y);
    }
    public get pos(): Vector {
        const obj = this.getObj();

        return V((obj.props.x ?? 0), (obj.props.y ?? 0));
    }

    public set angle(val: number) {
        this.internal.setPropFor<Schema.Component, "angle">(this.id, "angle", val);
    }
    public get angle(): number {
        return (this.getObj().props.angle ?? 0);
    }

    public get ports(): Record<string, Port[]> {
        return FromConcatenatedEntries(
            [...this.internal.getPortsForComponent(this.id)]
            .map((id) => this.circuit.constructPort(id))
            .map((p) => [p.group, p])
        );
    }

    public abstract firstAvailable(group: string): Port | undefined;
}
