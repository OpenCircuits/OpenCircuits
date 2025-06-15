import {V, Vector} from "Vector";

import {Schema} from "shared/api/circuit/schema";

import {GUID} from "..";
import {Assembler, AssemblerParams, AssemblyReason} from "./Assembler";
import {PortPos} from "./AssemblyCache";
import {Prim} from "./Prim";
import {Rect} from "math/Rect";


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
    (parent: Schema.Component, index: number, total: number) => PartialPortPos
>;


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PositioningHelpers {
    export function ConstantSpacing(index: number, total: number, size: number, opts: { spacing: number, shift?: number } = { spacing: 0.5 }) {
        return (index - (total - 1)/2 + (opts?.shift ?? 0)) * opts?.spacing / size;
    }
}

export class PortAssembler extends Assembler<Schema.Component> {
    private readonly factory: PortFactory;
    private readonly calcCompSize: (comp: Schema.Component) => Vector;

    public constructor(params: AssemblerParams, factory: PortFactory, calcCompSize: (comp: Schema.Component) => Vector) {
        super(params);

        this.factory = factory;
        this.calcCompSize = calcCompSize;
    }

    public calcPos(parent: Schema.Component, group: string, index: number, groupLen: number): PortPos {
        const pPos = this.factory[group](parent, index, groupLen);

        const compSize = this.calcCompSize(parent);

        const origin = pPos.origin;
        const target = (pPos.target ?? origin.add(pPos.dir.scale(this.options.defaultPortLength).scale(compSize.reciprocal())));
        const dir    = (pPos.dir    ?? target.sub(origin).normalize());

        return { origin, target, dir };
    }

    protected calcWorldPos(parentID: GUID, portID: GUID) {
        const { origin, target, dir } = this.cache.localPortPositions.get(portID)!;
        const transform = this.cache.componentTransforms.get(parentID)!;
        return {
            origin: transform.toWorldSpace(origin),
            target: transform.toWorldSpace(target),
            dir:    dir.rotate(transform.angle),
        };
    }

    public override assemble(parent: Schema.Component, reasons: Set<AssemblyReason>) {
        const added            = reasons.has(AssemblyReason.Added);
        const transformChanged = reasons.has(AssemblyReason.TransformChanged);
        const portAmtChanged   = reasons.has(AssemblyReason.PortsChanged);
        const selectionChanged = reasons.has(AssemblyReason.SelectionChanged);
        const propChanged      = reasons.has(AssemblyReason.PropChanged);

        const parentSelected = this.isSelected(parent.id);

        if (added || portAmtChanged) {
            const ports = this.circuit.getPortsByGroup(parent.id).unwrap();

            // Re-calculate local port positions
            Object.entries(ports).forEach(([group, portIDs]) => {
                portIDs.forEach((portID) => {
                    const port = this.circuit.getPortByID(portID).unwrap();

                    this.cache.localPortPositions.set(portID, this.calcPos(parent, group, port.index, portIDs.length));
                });
            });
        }

        if (added || transformChanged || portAmtChanged || propChanged) {
            const ports = this.circuit.getPortsForComponent(parent.id).unwrap();
            const parentTransform = this.cache.componentTransforms.get(parent.id)!;

            const labelPrims: Prim[] = [];

            // Re-assemble all prims
            const prims = [...ports].map((portID) => {
                // Transform all local port positions to new parent transform
                const pos = this.calcWorldPos(parent.id, portID);
                this.cache.portPositions.set(portID, pos);

                // Get port name for label
                const name = this.circuit.getPortByID(portID).map((p) => p.props.name).unwrap();
                if (name) {
                    const padding = 0.1;

                    const localPos = this.cache.localPortPositions.get(portID)!;
                    const textBounds = this.options.textMeasurer?.getBounds(this.options.fontStyle(), name)
                        ?? new Rect(V(), V());

                    const textSize = textBounds.size.add(2*padding);

                    // Text pos is the backwards from the origin by the text size
                    const textPos = localPos.origin.add(
                        localPos.dir.scale(textSize.scale(-0.5)).scale(parentTransform.scale.reciprocal()));

                    // Clamp the position inside the box
                    const pos = parentTransform.toWorldSpace(Vector.Clamp(textPos, V(-0.5, -0.5), V(0.5, 0.5)));

                    labelPrims.push({
                        kind:      "Text",
                        contents:  name,
                        pos:       pos.add(-textBounds.x, -textBounds.y),
                        angle:     parentTransform.angle,
                        fontStyle: this.options.fontStyle(),
                    })
                }

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
            this.cache.portLabelPrims.set(parent.id, labelPrims);
        } else if (selectionChanged) {
            const ports = this.circuit.getPortsForComponent(parent.id).unwrap();
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
