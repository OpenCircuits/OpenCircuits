import {GetDebugInfo} from "core/internal/utils/Debug";
import {Schema} from "core/schema";
import {V, Vector} from "../utils/math/Vector";
import {BaseObject} from "./BaseObject";
import {ComponentInfo} from "./ComponentInfo";
import {IComponent} from "./interfaces/Component";
import {Port} from "./Port";


export class Component extends BaseObject implements IComponent {
    public readonly baseKind = "Component";

    protected getObj(): Schema.Component {
        const obj = this.circuit.getObjByID(this.id);
        if (!obj)
            throw new Error(`API Component: Attempted to get component with ID ${this.id} could not find it!`);
        if (obj.baseKind !== "Component")
            throw new Error(`API Component: Attempted to get component with ID ${this.id} but received ${GetDebugInfo(obj)} instead!`);
        return obj;
    }

    public get info(): ComponentInfo {
        throw new Error("Unimplemented");
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
            .map((p) => new Port(this.circuit, p.id));
    }
}
