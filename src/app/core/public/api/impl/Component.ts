import {V, Vector} from "Vector";

import {AddErrE} from "core/utils/MultiError";

import {Schema} from "core/schema";

import {Component}     from "../Component";
import {ComponentInfo} from "../ComponentInfo";
import {Port}          from "../Port";

import {BaseObjectImpl} from "./BaseObject";
import {PortImpl}       from "./Port";


export class ComponentImpl extends BaseObjectImpl implements Component {
    public readonly baseKind = "Component";

    protected getObj(): Schema.Component {
        return this.circuit.getCompByID(this.id)
            .mapErr(AddErrE(`API Component: Attempted to get component with ID ${this.id} could not find it!`))
            .unwrap();
    }

    public get info(): ComponentInfo {
        throw new Error("Unimplemented");
    }

    public set x(val: number) {
        this.circuit.setPropFor(this.id, "x", val);
    }
    public get x(): number {
        return (this.getObj().props.x ?? 0);
    }
    public set y(val: number) {
        this.circuit.setPropFor(this.id, "y", val);
    }
    public get y(): number {
        return (this.getObj().props.y ?? 0);
    }

    public set pos(val: Vector) {
        this.circuit.setPropFor<Schema.Component, "x">(this.id, "x", val.x).unwrap();
        this.circuit.setPropFor<Schema.Component, "y">(this.id, "y", val.y).unwrap();
    }
    public get pos(): Vector {
        const obj = this.getObj();

        return V((obj.props.x ?? 0), (obj.props.y ?? 0));
    }

    public set angle(val: number) {
        this.circuit.setPropFor<Schema.Component, "angle">(this.id, "angle", val).unwrap();
    }
    public get angle(): number {
        return (this.getObj().props.angle ?? 0);
    }

    public get ports(): Port[] {
        return [...this.circuit.getPortsForComponent(this.id).unwrap()]
            .map((id) => new PortImpl(this.state, id));
    }
}
