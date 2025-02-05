import {Vector} from "Vector";

import {Schema} from "core/schema";

import {GUID}              from "..";
import {CirclePrim}        from "./prims/CirclePrim";
import {LinePrim}          from "./prims/LinePrim";
import {Assembler, AssemblerParams} from "./Assembler";
import {PortPos} from "./AssemblyCache";


export type PartialPortPos = {
    origin: Vector;
    target: Vector;
    dir?: undefined;
} | {
    origin: Vector;
    target?: undefined;
    dir: Vector;
} | PortPos;

export type PortFactory = Record<
    string,
    (index: number, total: number) => PartialPortPos
>;

export class PortAssembler extends Assembler<Schema.Component> {
    private readonly factory: PortFactory;

    public constructor(params: AssemblerParams, factory: PortFactory) {
        super(params);

        this.factory = factory;
    }

    public calcPos(group: string, index: number, groupLen: number): PortPos {
        const pPos = this.factory[group](index, groupLen);

        const origin = pPos.origin;
        const target = (pPos.target ?? origin.add(pPos.dir.scale(this.options.defaultPortLength)));
        const dir    = (pPos.dir    ?? target.sub(origin).normalize());

        return { origin, target, dir };
    }

    protected calcWorldPos(parentID: GUID, portID: GUID) {
        const { origin, target, dir } = this.cache.localPortPositions.get(portID)!;
        const transform = this.cache.componentTransforms.get(parentID)!;
        return {
            origin: transform.toWorldSpace(origin),
            target: transform.toWorldSpace(target),
            dir:    dir.rotate(transform.getAngle()),
        };
    }

    public assemble(parent: Schema.Component, _: unknown) {
        const transformChanged = /* use ev to see if parent transform changed */ true;
        const portAmtChanged   = /* use ev to see if the number of ports changed */ true;

        if (!transformChanged && !portAmtChanged)
            return;

        if (portAmtChanged) {
            const ports = this.circuit.doc.getPortsByGroup(parent.id).unwrap();

            // Re-calculate local port positions
            Object.entries(ports).forEach(([group, portIDs]) => {
                portIDs.forEach((portID) => {
                    const port = this.circuit.doc.getPortByID(portID).unwrap();
                    this.cache.localPortPositions.set(portID, this.calcPos(group, port.index, portIDs.length));
                })
            });
        }

        if (transformChanged || portAmtChanged) {
            const ports = this.circuit.doc.getPortsForComponent(parent.id).unwrap();

            // Transform all local port positions to new parent transform
            ports.forEach((portID) =>
                this.cache.portPositions.set(portID, this.calcWorldPos(parent.id, portID)));
        }

        if (transformChanged || portAmtChanged) {
            const ports = this.circuit.doc.getPortsForComponent(parent.id).unwrap();

            const { defaultPortRadius } = this.options;

            // Re-assemble all prims
            const prims = [...ports].flatMap((portID) => {
                const { origin, target } = this.cache.portPositions.get(portID)!;

                // Assemble the port-line and port-circle
                return [
                    new LinePrim(origin, target),
                    new CirclePrim(target, defaultPortRadius),
                ];
            });

            this.cache.portPrims.set(parent.id, prims);
        }
    }
}
