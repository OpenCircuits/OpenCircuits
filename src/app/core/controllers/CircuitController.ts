import {GetDebugInfo} from "core/utils/Debug";
import {GUID}         from "core/utils/GUID";
import {Observable}   from "core/utils/Observable";

import {Circuit}         from "core/models/Circuit";
import {AnyObj, AnyPort} from "core/models/types";

import {Component} from "core/models/types/base/Component";
import {Port}      from "core/models/types/base/Port";


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

type Comp<T extends AnyObj> = (T extends Component ? T : never);
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;

export class CircuitController<Obj extends AnyObj> extends Observable<CircuitEvent<Obj>> {
    protected circuit: Circuit<Obj>;

    public constructor(circuit: Circuit<Obj>) {
        super();

        this.circuit = circuit;
    }

    public hasObject(objID: GUID): boolean {
        return (this.circuit.objects.has(objID));
    }

    public addObject(obj: Obj): void {
        if (this.hasObject(obj.id))
            throw new Error(`CircuitController: Attempted to add ${GetDebugInfo(obj)} which already exists!`);
        this.circuit.objects.set(obj.id, obj);
        this.publish({ type: "obj", op: "added", obj });
    }

    public setPropFor(objID: GUID, key: string, val: string | boolean | number): void {
        const obj = this.getObject(objID);
        if (!obj) {
            throw new Error(`CircuitController: Attempted to set prop ${key} `
                            + `for [${objID}] which isn't in the circuit!`);
        }
        if (!(key in obj)) {
            throw new Error(`CircuitController: Attempted to set prop ${key} `
                            + `from ${GetDebugInfo(obj)} which doesn't exist!`);
        }
        // TODO: fix the need for this cast?
        (obj as Record<string, string | boolean | number>)[key] = val;
        this.publish({ type: "obj", op: "edited", obj, prop: key });
    }

    public removeObject(obj: Obj): void {
        if (!this.hasObject(obj.id))
            throw new Error(`CircuitController: Attempted to remove ${GetDebugInfo(obj)}) which isn't in the circuit!`);
        this.circuit.objects.delete(obj.id);
        this.publish({ type: "obj", op: "removed", obj });
    }

    public getPropFrom(objID: GUID, key: string): string | boolean | number {
        const obj = this.getObject(objID);
        if (!obj) {
            throw new Error(`CircuitController: Attempted to get prop ${key} `
                            + `from [${objID}] which isn't in the circuit!`);
        }
        if (!(key in obj)) {
            throw new Error(`CircuitController: Attempted to get prop ${key} `
                            + `from ${GetDebugInfo(obj)} which doesn't exist!`);
        }
        // TODO: fix the need for this cast?
        return (obj as Record<string, string | boolean | number>)[key];
    }

    public getObject(objID: GUID): Obj | undefined {
        return (this.circuit.objects.get(objID));
    }

    public getObjs(): GUID[] {
        return [...this.circuit.objects.keys()];
    }

    public getPortParent(portID: GUID): Comp<Obj> {
        const port = this.getObject(portID);
        if (!port)
            throw new Error(`CircuitController: Failed to find port [${portID}]!`);
        if (port.baseKind !== "Port")
            throw new Error(`CircuitController: Attempted to get port but found ${GetDebugInfo(port)}`);
        if (!this.hasObject(port.parent)) {
            throw new Error("CircuitController: Failed to find parent " +
                            `[${port.parent}] for ${GetDebugInfo(port)}!`);
        }
        const parent = this.getObject(port.parent)!;
        if (parent.baseKind !== "Component")
            throw new Error(`CircuitController: Received a non-component parent for ${GetDebugInfo(port)}!`);
        return parent as Comp<Obj>;
    }

    public getPortsFor(objID: GUID): Port[] {
        if (!this.hasObject(objID)) {
            throw new Error(`CircuitController: Attempted to get Ports for [${objID}]`+
                            " which doesn't exist!");
        }
        return (
            [...this.circuit.objects.values()]
                .filter((obj) => (obj.baseKind === "Port" && obj.parent === objID)) as Port[]
        );
    }
}
