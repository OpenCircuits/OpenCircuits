import {GetDebugInfo} from "core/utils/Debug";
import {GUID}         from "core/utils/GUID";
import {Observable}   from "core/utils/Observable";

import {Circuit}                           from "core/models/Circuit";
import {AnyNode, AnyObj, AnyPort, AnyWire} from "core/models/types";

import {Component} from "core/models/types/base/Component";
import {Port}      from "core/models/types/base/Port";
import {Wire}      from "core/models/types/base/Wire";


export type ObjEvent<Obj extends AnyObj> = {
    type: "obj";
    obj: Obj;
} & ({
    op: "added" | "removed";
} | {
    op: "edited";
    prop: string;
})
export type ICDataEvent = {
    type: "ic";
    op:   "added" | "removed";
    icID: GUID;
}
export type CircuitEvent<Obj extends AnyObj> = ObjEvent<Obj> | ICDataEvent;

type c_Comp<T extends AnyObj> = (T extends Component ? T : never);
type c_Port<T extends AnyObj> = (T extends Port ? T : never);
type c_Wire<T extends AnyObj> = (T extends Wire ? T : never);
type c_Node<T extends AnyObj> = (T extends AnyNode ? T : never);


export class CircuitController<Obj extends AnyObj> extends Observable<CircuitEvent<Obj>> {
    protected readonly wireKind: c_Wire<Obj>["kind"];
    protected readonly nodeKind: c_Node<Obj>["kind"];

    protected circuit: Circuit<Obj>;

    public constructor(circuit: Circuit<Obj>, wireKind: c_Wire<Obj>["kind"], nodeKind: c_Node<Obj>["kind"]) {
        super();

        this.wireKind = wireKind;
        this.nodeKind = nodeKind;
        this.circuit = circuit;
    }

    public hasObj(obj: Obj): boolean {
        return (this.circuit.objects.has(obj.id));
    }

    public addObj(obj: Obj): void {
        if (this.hasObj(obj))
            throw new Error(`CircuitController: Attempted to add ${GetDebugInfo(obj)} which already exists!`);
        this.circuit.objects.set(obj.id, obj);
        this.publish({ type: "obj", op: "added", obj });
    }

    public setPropFor(obj: Obj, key: string, val: string | boolean | number): void {
        if (!(key in obj)) {
            throw new Error(`CircuitController: Attempted to set prop ${key} `
                            + `from ${GetDebugInfo(obj)} which doesn't exist!`);
        }
        // TODO: fix the need for this cast?
        (obj as Record<string, string | boolean | number>)[key] = val;
        this.publish({ type: "obj", op: "edited", obj, prop: key });
    }

    public removeObj(obj: Obj): void {
        if (!this.hasObj(obj))
            throw new Error(`CircuitController: Attempted to remove ${GetDebugInfo(obj)}) which isn't in the circuit!`);
        this.circuit.objects.delete(obj.id);
        this.publish({ type: "obj", op: "removed", obj });
    }

    public getPropFrom(obj: Obj, key: string): string | boolean | number {
        if (!(key in obj)) {
            throw new Error(`CircuitController: Attempted to get prop ${key} `
                            + `from ${GetDebugInfo(obj)} which doesn't exist!`);
        }
        // TODO: fix the need for this cast?
        return (obj as Record<string, string | boolean | number>)[key];
    }

    public getObj(objID: GUID): Obj | undefined {
        return (this.circuit.objects.get(objID));
    }

    public getObjs(): GUID[] {
        return [...this.circuit.objects.keys()];
    }

    public getPortParent(port: c_Port<Obj>): c_Comp<Obj> {
        const parent = this.getObj(port.parent);
        if (!parent) {
            throw new Error("CircuitController: Failed to find parent " +
                            `[${port.parent}] for ${GetDebugInfo(port)}!`);
        }
        if (parent.baseKind !== "Component")
            throw new Error(`CircuitController: Received a non-component parent for ${GetDebugInfo(port)}!`);
        return parent as c_Comp<Obj>;
    }

    public getPortsFor(comp: c_Comp<Obj>): Array<c_Port<Obj>> {
        // if (!this.hasObj(objID))
        //     throw new Error(`CircuitController: Attempted to get Ports for [${objID}] which doesn't exist!`);
        // TODO: make this more efficient with some map to cache this relation
        return (
            [...this.circuit.objects.values()]
                .filter((obj) =>
                    (obj.baseKind === "Port" && obj.parent === comp.id)) as Array<c_Port<Obj>>
        );
    }

    public getWiresFor(port: c_Port<Obj>): Array<c_Wire<Obj>> {
        // TODO: make this more efficient with some map to cache this relation
        return (
            [...this.circuit.objects.values()]
                .filter((o) =>
                    (o.baseKind === "Wire" &&
                     (o.p1 === port.id || o.p2 === port.id))) as Array<c_Wire<Obj>>
        );
    }

    public getPortsForWire(wire: c_Wire<Obj>): [c_Port<Obj>, c_Port<Obj>] {
        const p1 = this.getObj(wire.p1);
        const p2 = this.getObj(wire.p2);
        if (!p1) {
            throw new Error("CircuitController: Failed to find port 1 " +
                            `[${wire.p1}] for ${GetDebugInfo(wire)}!`);
        }
        if (!p2) {
            throw new Error("CircuitController: Failed to find port 2 " +
                            `[${wire.p2}] for ${GetDebugInfo(wire)}!`);
        }
        if (p1.baseKind !== "Port")
            throw new Error("DigitalWireView: Received a non-port p1 of " +
                            `${GetDebugInfo(p1)} for ${GetDebugInfo(wire)}!`);
        if (p2.baseKind !== "Port")
            throw new Error("DigitalWireView: Received a non-port p2 of " +
                            `${GetDebugInfo(p2)} for ${GetDebugInfo(wire)}!`);
        return [p1 as c_Port<Obj>, p2 as c_Port<Obj>];
    }

    public getWireKind(): c_Wire<Obj>["kind"] {
        return this.wireKind;
    }

    public getNodeKind(): c_Node<Obj>["kind"] {
        return this.nodeKind;
    }
}
