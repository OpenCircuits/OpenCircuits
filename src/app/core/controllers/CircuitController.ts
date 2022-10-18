import {GetDebugInfo} from "core/utils/Debug";
import {GUID}         from "core/utils/GUID";
import {Observable}   from "core/utils/Observable";

import {Circuit, DefaultCircuit} from "core/models/Circuit";
import {AnyNode, AnyObj}         from "core/models/types";

import {AnyComponentFrom, AnyPortFrom, AnyWireFrom} from "core/models/types/utils";


export type ObjEvent<Obj extends AnyObj> = {
    type: "obj";
    obj: Obj;
} & ({
    op: "added" | "removed";
} | {
    op: "edited";
    prop: string;
    val: string | boolean | number;
})
export type ICDataEvent = {
    type: "ic";
    op:   "added" | "removed";
    icID: GUID;
}
export type ResetEvent = {
    type: "reset";
}
export type CircuitEvent<Obj extends AnyObj> = ObjEvent<Obj> | ICDataEvent | ResetEvent;

// TODO: find better name and place for these
type c_Node<T extends AnyObj> = (T extends AnyNode ? T : never);


export class CircuitController<Obj extends AnyObj = AnyObj> extends Observable<CircuitEvent<Obj>> {
    protected readonly wireKind: AnyWireFrom<Obj>["kind"];
    protected readonly nodeKind: c_Node<Obj>["kind"];

    protected circuit: Circuit<Obj>;

    // It's assumed that this circuit has no objects yet
    public constructor(circuit: Circuit<Obj>, wireKind: AnyWireFrom<Obj>["kind"], nodeKind: c_Node<Obj>["kind"]) {
        super();

        this.wireKind = wireKind;
        this.nodeKind = nodeKind;
        this.circuit  = circuit;
    }

    public hasObj(obj: Obj): boolean {
        return (obj.id in this.circuit.objects);
    }

    public addObj(obj: Obj): void {
        if (this.hasObj(obj))
            throw new Error(`CircuitController: Attempted to add ${GetDebugInfo(obj)} which already exists!`);
        this.circuit.objects[obj.id] = obj;
        this.publish({ type: "obj", op: "added", obj });
    }

    public setMetadata<K extends keyof Circuit<Obj>["metadata"]>(key: K, val: Circuit<Obj>["metadata"][K]) {
        this.circuit.metadata[key] = val;
    }

    // TODO: Have the key/vals be type-safe?
    public setPropFor(obj: Obj, key: string, val: string | boolean | number): void {
        if (!(key in obj)) {
            throw new Error(`CircuitController: Attempted to set prop ${key} `
                            + `from ${GetDebugInfo(obj)} which doesn't exist!`);
        }

        this.publish({ type: "obj", op: "edited", obj, prop: key, val });

        // TODO: fix the need for this cast?
        obj[key as keyof Obj] = val as Obj[keyof Obj];
    }

    public removeObj(obj: Obj): void {
        if (!this.hasObj(obj))
            throw new Error(`CircuitController: Attempted to remove ${GetDebugInfo(obj)}) which isn't in the circuit!`);
        delete this.circuit.objects[obj.id];
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
        return (this.circuit.objects[objID]);
    }

    public getObjs(): Obj[] {
        return Object.values(this.circuit.objects);
    }

    public findPort(parent: AnyComponentFrom<Obj>, group: number, index: number): AnyPortFrom<Obj> | undefined {
        return this.getPortsFor(parent)
            .find((port) => (port.group === group && port.index === index));
    }

    public getPortParent(port: AnyPortFrom<Obj>): AnyComponentFrom<Obj> {
        const parent = this.getObj(port.parent);
        if (!parent) {
            throw new Error("CircuitController: Failed to find parent " +
                            `[${port.parent}] for ${GetDebugInfo(port)}!`);
        }
        if (parent.baseKind !== "Component")
            throw new Error(`CircuitController: Received a non-component parent for ${GetDebugInfo(port)}!`);
        return parent as AnyComponentFrom<Obj>;
    }

    public getConnectedComponents(wire: AnyWireFrom<Obj>): [AnyComponentFrom<Obj>, AnyComponentFrom<Obj>] {
        const [p1, p2] = this.getPortsForWire(wire);
        return [this.getPortParent(p1), this.getPortParent(p2)];
    }

    public getConnectionsFor(comp: AnyComponentFrom<Obj>): Array<AnyWireFrom<Obj>> {
        return this.getPortsFor(comp).flatMap((p) => this.getWiresFor(p));
    }

    public getPortsFor(comp: AnyComponentFrom<Obj>): Array<AnyPortFrom<Obj>> {
        // if (!this.hasObj(objID))
        //     throw new Error(`CircuitController: Attempted to get Ports for [${objID}] which doesn't exist!`);
        // TODO: make this more efficient with some map to cache this relation
        return (
            this.getObjs()
                .filter((obj) =>
                    (obj.baseKind === "Port" && obj.parent === comp.id)) as Array<AnyPortFrom<Obj>>
        );
    }

    public getWiresFor(port: AnyPortFrom<Obj>): Array<AnyWireFrom<Obj>> {
        // TODO: make this more efficient with some map to cache this relation
        return (
            this.getObjs()
                .filter((o) =>
                    (o.baseKind === "Wire" &&
                     (o.p1 === port.id || o.p2 === port.id))) as Array<AnyWireFrom<Obj>>
        );
    }

    public getPortsForWire(wire: AnyWireFrom<Obj>): [AnyPortFrom<Obj>, AnyPortFrom<Obj>] {
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
            throw new Error("CircuitController: Received a non-port p1 of " +
                            `${GetDebugInfo(p1)} for ${GetDebugInfo(wire)}!`);
        if (p2.baseKind !== "Port")
            throw new Error("CircuitController: Received a non-port p2 of " +
                            `${GetDebugInfo(p2)} for ${GetDebugInfo(wire)}!`);
        return [p1 as AnyPortFrom<Obj>, p2 as AnyPortFrom<Obj>];
    }

    public getSiblingPorts(p: AnyPortFrom<Obj>): Array<AnyPortFrom<Obj>> {
        return this.getPortsFor(this.getPortParent(p)).filter((q) => (q !== p));
    }

    public reset(replacement: Circuit<Obj> = DefaultCircuit()): void {
        this.circuit = replacement;
        this.publish({ type: "reset" });
    }

    public getMetadata(): Readonly<Circuit<Obj>["metadata"]> {
        return this.circuit.metadata;
    }

    public getRawModel(): Readonly<Circuit<Obj>> {
        return this.circuit;
    }

    public getWireKind(): AnyWireFrom<Obj>["kind"] {
        return this.wireKind;
    }

    public getNodeKind(): c_Node<Obj>["kind"] {
        return this.nodeKind;
    }
}
