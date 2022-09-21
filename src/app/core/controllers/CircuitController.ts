import {GUID}       from "core/utils/GUID";
import {Observable} from "core/utils/Observable";

import {Circuit} from "core/models/Circuit";
import {AnyObj}  from "core/models/types";

import {Port} from "core/models/types/base/Port";


export type ObjEvent<Obj extends AnyObj> = {
    type: "obj";
    op:   "added" | "removed" | "edited";
    obj:  Obj;
}
export type ICDataEvent = {
    type: "ic";
    op:   "added" | "removed";
    icID: GUID;
}
export type CircuitEvent<Obj extends AnyObj> = ObjEvent<Obj> | ICDataEvent;

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
        if (this.hasObject(obj.id)) {
            throw new Error(`CircuitController: Attempted to add Object ${obj.kind}`+
                            `[${obj.id}](${obj.name}) which already exists!`);
        }
        this.circuit.objects.set(obj.id, obj);
        this.publish({ type: "obj", op: "added", obj });
    }

    public removeObject(obj: Obj): void {
        if (!this.hasObject(obj.id)) {
            throw new Error(`CircuitController: Attempted to remove Object ${obj.kind}`+
                            `[${obj.id}](${obj.name}) which isn't in the circuit!`);
        }
        this.circuit.objects.delete(obj.id);
        this.publish({ type: "obj", op: "removed", obj });
    }

    public getObject(objID: GUID): Obj | undefined {
        return (this.circuit.objects.get(objID));
    }

    public getObjs(): GUID[] {
        return [...this.circuit.objects.keys()];
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
