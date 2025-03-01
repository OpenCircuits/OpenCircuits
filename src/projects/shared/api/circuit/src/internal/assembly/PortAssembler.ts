import {Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {GUID} from "..";
import {Assembler, AssemblerParams, AssemblyReason} from "./Assembler";
import {PortPos} from "./AssemblyCache";
import {Prim} from "./Prim";


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

    public override assemble(parent: Schema.Component, reasons: Set<AssemblyReason>) {
        const added            = reasons.has(AssemblyReason.Added);
        const transformChanged = reasons.has(AssemblyReason.TransformChanged);
        const portAmtChanged   = reasons.has(AssemblyReason.PortsChanged);
        const selectionChanged = reasons.has(AssemblyReason.SelectionChanged);

        const parentSelected = this.isSelected(parent.id);

        if (added || portAmtChanged) {
            const ports = this.circuit.doc.getPortsByGroup(parent.id).unwrap();

            // Re-calculate local port positions
            Object.entries(ports).forEach(([group, portIDs]) => {
                portIDs.forEach((portID) => {
                    const port = this.circuit.doc.getPortByID(portID).unwrap();

                    this.cache.localPortPositions.set(portID, this.calcPos(group, port.index, portIDs.length));
                });
            });
        }

        if (added || transformChanged || portAmtChanged) {
            const ports = this.circuit.doc.getPortsForComponent(parent.id).unwrap();

            // Re-assemble all prims
            const prims = [...ports].map((portID) => {
                // Transform all local port positions to new parent transform
                const pos = this.calcWorldPos(parent.id, portID);
                this.cache.portPositions.set(portID, pos);

                // Assemble the port-line and port-circle
                const selected = this.isSelected(portID);
                const { lineStyle, circleStyle } = this.options.portStyle(selected, parentSelected);
                return [
                    portID,
                    [
                        {
                            kind:  "Line",
                            p1:    pos.origin,
                            p2:    pos.target,
                            style: lineStyle,

                            ignoreHit: true,
                        },
                        {
                            kind:   "Circle",
                            pos:    pos.target,
                            radius: this.options.defaultPortRadius,
                            style:  circleStyle,
                        },
                    ],
                ] satisfies [GUID, Prim[]];
            });

            this.cache.portPrims.set(parent.id, new Map<GUID, Prim[]>(prims));
        } else if (selectionChanged) {
            const ports = this.circuit.doc.getPortsForComponent(parent.id).unwrap();
            const prims = this.cache.portPrims.get(parent.id)!;

            [...ports].forEach((portID) => {
                const [line, circle] = prims.get(portID)!;

                if (line.kind !== "Line" || circle.kind !== "Circle") {
                    console.error(`Invalid prim type in PortAssembler! ${line.kind}, ${circle.kind}`);
                    return;
                }

                const selected = this.isSelected(portID);
                const { lineStyle, circleStyle } = this.options.portStyle(selected, parentSelected);

                line.style = lineStyle;
                circle.style = circleStyle;
            });
        }
    }
}
