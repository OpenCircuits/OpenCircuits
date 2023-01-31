import {V, Vector} from "Vector";

import {Schema} from "core/schema";

import {Component}     from "../Component";
import {ComponentInfo} from "../ComponentInfo";
import {Port}          from "../Port";

import {BaseObjectImpl} from "./BaseObject";
import {PortImpl}       from "./Port";


export class ComponentImpl extends BaseObjectImpl implements Component {
    public readonly baseKind = "Component";

    protected getObj(): Schema.Component {
        const obj = this.circuit.getCompByID(this.id);
        if (!obj)
            throw new Error(`API Component: Attempted to get component with ID ${this.id} could not find it!`);
        return obj;
    }

    public get info(): ComponentInfo {
        throw new Error("Unimplemented");
    }

    public set x(val: number) {
        this.circuit.setPropFor(this.getObj(), "x", val);
    }
    public get x(): number {
        return (this.getObj().props.x ?? 0);
    }
    public set y(val: number) {
        this.circuit.setPropFor(this.getObj(), "y", val);
    }
    public get y(): number {
        return (this.getObj().props.y ?? 0);
    }

    public set pos(val: Vector) {
        const obj = this.getObj();

        this.circuit.setPropFor(obj, "x", val.x);
        this.circuit.setPropFor(obj, "y", val.y);
    }
    public get pos(): Vector {
        const obj = this.getObj();

        return V((obj.props.x ?? 0), (obj.props.y ?? 0));
    }

    public set angle(val: number) {
        this.circuit.setPropFor(this.getObj(), "angle", val);
    }
    public get angle(): number {
        return (this.getObj().props.angle ?? 0);
    }

    public get ports(): Port[] {
        return this.circuit.getPortsForComponent(this.getObj())
            .map((p) => new PortImpl(this.circuit, p.id));
    }
}
