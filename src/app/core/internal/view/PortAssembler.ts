import {Vector} from "Vector";

import {Schema} from "core/schema";

import {GUID}              from "..";
import {CircuitInternal}   from "../impl/CircuitInternal";
import {SelectionsManager} from "../impl/SelectionsManager";
import {CircuitView}       from "./CircuitView";
import {Circle}            from "./rendering/prims/Circle";
import {Line}              from "./rendering/prims/Line";
import {Assembler}         from "./Assembler";
import {Style}             from "./rendering/Style";


export interface PortPos {
    origin: Vector;
    target: Vector;
    dir: Vector;
}
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

    public constructor(circuit: CircuitInternal, view: CircuitView,
                       selections: SelectionsManager, factory: PortFactory) {
        super(circuit, view, selections);

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
        const { origin, target, dir } = this.view.localPortPositions.get(portID)!;
        const transform = this.view.componentTransforms.get(parentID)!;
        return {
            origin: transform.toWorldSpace(origin),
            target: transform.toWorldSpace(target),
            dir:    dir.rotate(transform.getAngle()),
        };
    }

    public assemble(parent: Schema.Component, ev: unknown) {
        const transformChanged = /* use ev to see if parent transform changed */ true;
        const selectionChanged = /* use ev to see if parent wwas de/selected */ true;
        const portAmtChanged   = /* use ev to see if the number of ports changed */ true;

        if (!transformChanged || !selectionChanged || !portAmtChanged)
            return;

        if (portAmtChanged) {
            const ports = this.circuit.getPortsByGroup(parent.id).unwrap();

            // Re-calculate local port positions
            Object.entries(ports).forEach(([group, portIDs]) => {
                portIDs.forEach((portID) => {
                    const port = this.circuit.getPortByID(portID).unwrap();
                    this.view.localPortPositions.set(portID, this.calcPos(group, port.index, portIDs.length));
                })
            });
        }

        if (transformChanged || portAmtChanged) {
            const ports = this.circuit.getPortsForComponent(parent.id).unwrap();

            // Transform all local port positions to new parent transform
            ports.forEach((portID) =>
                this.view.portPositions.set(portID, this.calcWorldPos(parent.id, portID)));
        }

        if (transformChanged || portAmtChanged || selectionChanged) {
            const ports = this.circuit.getPortsForComponent(parent.id).unwrap();

            const parentSelected = this.selections.has(parent.id);

            const { selectedBorderColor, defaultBorderColor, selectedFillColor,
                    defaultFillColor, portLineWidth, portBorderWidth, defaultPortRadius } = this.options;

            // Re-assemble all prims
            const prims = [...ports].flatMap((portID) => {
                const { origin, target } = this.view.portPositions.get(portID)!;
                const selected = this.selections.has(portID);

                // Assemble the port-line and port-circle
                const line = new Line(origin, target, new Style(undefined,
                    ((parentSelected && !selected) ? selectedBorderColor : defaultBorderColor),
                    portLineWidth,
                ));
                const circle = new Circle(target, defaultPortRadius, new Style(
                    ((parentSelected || selected) ? selectedFillColor   : defaultFillColor),
                    ((parentSelected || selected) ? selectedBorderColor : defaultBorderColor),
                    portBorderWidth,
                ));
                return [line, circle];
            });

            this.view.portPrims.set(parent.id, prims);
        }
    }
}
