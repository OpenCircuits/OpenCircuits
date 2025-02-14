import {V, Vector} from "Vector";

import {AddErrE}                         from "shared/api/circuit/utils/MultiError";
import {FromConcatenatedEntries, extend} from "shared/api/circuit/utils/Functions";
import {GUID}                            from "shared/api/circuit/internal";

import {Schema} from "shared/api/circuit/schema";

import {Circuit}   from "../Circuit";
import {Component} from "../Component";
import {Port}      from "../Port";

import {BaseObjectImpl}             from "./BaseObject";
import {CircuitState, CircuitTypes} from "./CircuitState";


export function ComponentImpl<T extends CircuitTypes>(
    circuit: Circuit,
    state: CircuitState<T>,
    id: GUID,
) {
    const { internal, constructPort } = state;

    function getComponent() {
        return internal.doc.getCompByID(id)
            .mapErr(AddErrE(`API Component: Attempted to get component with ID ${id} that doesn't exist!`))
            .unwrap();
    }

    const base = BaseObjectImpl(state, id);

    return extend(base, {
        baseKind: "Component",

        set x(val: number) {
            internal.setPropFor<Schema.Component, "x">(id, "x", val);
        },
        get x(): number {
            return (getComponent().props.x ?? 0);
        },
        set y(val: number) {
            internal.setPropFor(id, "y", val);
        },
        get y(): number {
            return (getComponent().props.y ?? 0);
        },
        set pos(val: Vector) {
            internal.beginTransaction();
            internal.setPropFor<Schema.Component, "x">(id, "x", val.x).unwrap();
            internal.setPropFor<Schema.Component, "y">(id, "y", val.y).unwrap();
            internal.commitTransaction();
        },
        get pos(): Vector {
            const obj = getComponent();
            return V((obj.props.x ?? 0), (obj.props.y ?? 0));
        },
        set angle(val: number) {
            internal.setPropFor<Schema.Component, "angle">(id, "angle", val);
        },
        get angle(): number {
            return (getComponent().props.angle ?? 0);
        },

        get ports(): Record<string, T["Port[]"]> {
            return FromConcatenatedEntries(this.allPorts.map((p) => [p.group, p]));
        },
        get allPorts(): T["Port[]"] {
            return [...internal.doc.getPortsForComponent(id).unwrap()]
                .map((id) => constructPort(id));
        },

        get connectedComponents(): T["Component[]"] {
            throw new Error("Unimplemented!");
        },

        setNumPorts(group: string, amt: number): boolean {
            // TODO[model_refactor](leon) revisit this and decide on a functionality
            const curConfig = {} as Record<string, number>;
            internal.doc.getPortsForComponent(base.id)
                .map((ids) => [...ids]
                    .map((id) => circuit.getPort(id)!))
                .unwrap()
                .forEach(({ group }) =>
                    curConfig[group] = (curConfig[group] ?? 0) + 1);

            // Already at that amount of ports, so do nothing
            if (curConfig[group] === amt)
                return true;

            const config = {
                ...curConfig,
                [group]: amt,
            };
            const isValid = internal.doc.getComponentInfo(base.kind).checkPortConfig(config);
            if (!isValid.ok)
                return false;

            internal.beginTransaction();
            const result = internal.setPortConfig(base.id, config);
            if (!result.ok) {
                internal.cancelTransaction();
                return false;
            }
            internal.commitTransaction();
            return true;
        },
        firstAvailable(group: string): T["Port"] | undefined {
            throw new Error("Unimplemented!");
        },
        delete(): void {
            throw new Error("Unimplemented!");
        },
    } as const) satisfies Omit<Component, "isNode" | "info">;
}
