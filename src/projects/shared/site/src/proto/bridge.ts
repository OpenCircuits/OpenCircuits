/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable @typescript-eslint/no-unused-vars */
// This file has "bridge" functions from the internal rep (Circuit.Schema)
// to the wire rep (Circuit.proto) and vice versa.

import * as uuid from "uuid";

import {MapObj}       from "shared/api/circuit/utils/Functions";
import {GUID, Schema} from "shared/api/circuit/schema";

import * as ProtoSchema from "./Circuit";
import {Circuit, Component, IntegratedCircuit, Obj, PortConfig, ReadonlyComponent, ReadonlyWire, Wire} from "shared/api/circuit/public";
import {V} from "Vector";
import {BaseObject} from "shared/api/circuit/public/BaseObject";


export function CircuitToProto(circuit: Circuit): ProtoSchema.Circuit {
    function ConvertId(id: GUID): Uint8Array {
        return uuid.parse(id) as Uint8Array;
    }

    function ConvertProps(props: Record<string, number | string | boolean>): Record<string, ProtoSchema.Prop> {
        return MapObj(props, ([_key, prop]) =>
                    (typeof prop === "boolean"
                        ? { boolVal: prop }
                        : (typeof prop === "number")
                        ? (Number.isInteger(prop)
                            ? { intVal: prop }
                            : { floatVal: prop })
                        : (typeof prop === "string")
                        ? { strVal: prop } : {}));
    }

    function ConvertComponent(c: ReadonlyComponent): ProtoSchema.Component {
        const { name, isSelected, x, y, angle, zIndex, ...otherProps } = c.getProps()

        const matchesPortConfig = (pc: PortConfig) =>
            Object.entries(pc).every(([group, numPorts]) => c.ports[group]?.length === numPorts);

        const isDefaultPortConfig = matchesPortConfig(c.info.defaultPortConfig);
        const portConfigIdx = c.info.portConfigs.findIndex(matchesPortConfig);

        return {
            kind: (c.isIC() ? "IC" : c.kind),

            icId: (c.isIC() ? ConvertId(c.kind) : undefined),

            portConfigIdx: (isDefaultPortConfig || portConfigIdx === -1 ? undefined : portConfigIdx),

            name:       (name ? name as string : undefined),
            isSelected: (isSelected ? isSelected as boolean : undefined),
            x:          (x ? x as number : undefined),
            y:          (y ? y as number : undefined),
            angle:      (angle ? angle as number : undefined),

            otherProps:    ConvertProps(otherProps),
            portOverrides: c.allPorts.map((p) => {
                const { name, isSelected, ...otherProps } = p.getProps();
                return ({
                    group: p.group,
                    index: p.index,

                    name:       p.name,
                    isSelected: p.isSelected,

                    otherProps: ConvertProps(otherProps),
                });
            }).filter((p) => (p.name || p.isSelected || Object.keys(p.otherProps).length > 0)), // TODODOTOTOTO
        };
    }

    function ConvertWire(w: ReadonlyWire, comps: ReadonlyComponent[]): ProtoSchema.Wire {
        const { name, isSelected, color, zIndex, ...otherProps } = w.getProps();

        return {
            kind: w.kind,

            p1ParentIdx: comps.findIndex((c) => c.id === w.p1.parent.id),
            p1Group:     w.p1.group,
            p1Idx:       w.p1.index,

            p2ParentIdx: comps.findIndex((c) => c.id === w.p2.parent.id),
            p2Group:     w.p2.group,
            p2Idx:       w.p2.index,

            name:       (name ? name as string : undefined),
            isSelected: (isSelected ? isSelected as boolean : undefined),
            //          Convert color to hex integer
            color:      (color ? parseInt((color as string).slice(1), 16) : undefined),

            otherProps: ConvertProps(otherProps),
        };
    }

    function ConvertMetadata(circuit: Circuit | IntegratedCircuit): ProtoSchema.CircuitMetadata {
        return {
            id:      ConvertId(circuit.id),
            name:    circuit.name,
            desc:    circuit.desc,
            thumb:   circuit.thumbnail,
            version: "1.0/0",  // TODO: Update this to use the actual version
        };
    }

    function ConvertICMetadata(ic: IntegratedCircuit, components: ReadonlyComponent[]): ProtoSchema.IntegratedCircuitMetadata {
        return {
            metadata: ConvertMetadata(ic),

            displayWidth:  ic.display.size.x,
            displayHeight: ic.display.size.y,

            pins: ic.display.pins.map((p) => {
                const compIdx = components.findIndex((c) => (c.allPorts.find((port) => port.id === p.id)));
                const portIdx = components[compIdx].allPorts.findIndex((port) => port.id === p.id);
                return ({
                    internalCompIdx: compIdx,
                    internalPortIdx: portIdx,

                    group: p.group,
                    name:  p.name,

                    x:  p.pos.x,
                    y:  p.pos.y,
                    dx: p.dir.x,
                    dy: p.dir.y,
                });
            }),
        };
    }

    function ConvertIC(ic: IntegratedCircuit): ProtoSchema.IntegratedCircuit {
        const comps = ic.components.sort((c1, c2) => (c1.zIndex - c2.zIndex));
        const wires = ic.wires.sort((w1, w2) => (w1.zIndex, w2.zIndex));

        return {
            metadata:   ConvertICMetadata(ic, comps),
            components: comps.map(ConvertComponent),
            wires:      wires.map((w) => ConvertWire(w, comps)),
        };
    }

    // Sort by z-index
    const comps = circuit.getComponents().sort((c1, c2) => (c1.zIndex - c2.zIndex));
    const wires = circuit.getWires().sort((w1, w2) => (w1.zIndex, w2.zIndex));

    return ProtoSchema.Circuit.create({
        metadata:   ConvertMetadata(circuit),
        // camera:   schema.camera,  TODODOODOD
        ics:        circuit.getICs().map(ConvertIC),
        components: comps.map(ConvertComponent),
        wires:      wires.map((w) => ConvertWire(w, comps)),
    });
}

export function ProtoToCircuit<C extends Circuit>(proto: ProtoSchema.Circuit, mainCircuit: C, CreateCircuit: (id: GUID) => C): C {
    function ConvertId(id: Uint8Array): GUID {
        return uuid.stringify(id);
    }

    function SetProps(obj: BaseObject, props: Record<string, ProtoSchema.Prop>) {
        for (const [key, prop] of Object.entries(props)) {
            if (prop.boolVal !== undefined) {
                obj.setProp(key, prop.boolVal);
            } else if (prop.intVal !== undefined) {
                obj.setProp(key, prop.intVal);
            } else if (prop.floatVal !== undefined) {
                obj.setProp(key, prop.floatVal);
            } else if (prop.strVal !== undefined) {
                obj.setProp(key, prop.strVal);
            }
        }
    }

    function SetObjects(circuit: Circuit, objs: { components: ProtoSchema.Component[], wires: ProtoSchema.Wire[] }) {
        const compIdMap = new Map<number, GUID>();

        for (let i = 0; i < objs.components.length; i++) {
            const c = objs.components[i];

            const comp = circuit.placeComponentAt(c.kind === "IC" ? ConvertId(c.icId!) : c.kind, V(c.x ?? 0, c.y ?? 0));

            compIdMap.set(i, comp.id);

            // Load props
            comp.name = c.name;
            comp.isSelected = c.isSelected ?? false;
            comp.angle = c.angle ?? 0;
            comp.zIndex = i;
            SetProps(comp, c.otherProps);

            // Load port config and port overrides
            if (c.portConfigIdx !== undefined)
                comp.setPortConfig(comp.info.portConfigs[c.portConfigIdx]);

            for (const p of c.portOverrides) {
                const port = comp.ports[p.group][p.index];

                // Load props
                port.name = p.name;
                port.isSelected = p.isSelected ?? false;
                SetProps(port, p.otherProps);
            }
        }

        for (const w of objs.wires) {
            const p1Parent = circuit.getComponent(compIdMap.get(w.p1ParentIdx)!)!;
            const p1Port = p1Parent.ports[w.p1Group][w.p1Idx];

            const p2Parent = circuit.getComponent(compIdMap.get(w.p2ParentIdx)!)!;
            const p2Port = p2Parent.ports[w.p2Group][w.p2Idx];

            const wire = p1Port.connectTo(p2Port)!;

            // Load props
            wire.name = w.name;
            wire.isSelected = w.isSelected ?? false;
            if (w.color !== undefined) // Convert color to hex string
                wire.setProp("color", `#${(w.color & 0xFF_FF_FF).toString(16).padStart(6, "0")}`);
            SetProps(wire, w.otherProps);
        }

        return compIdMap;
    }

    function SetIC(circuit: Circuit, ic: ProtoSchema.IntegratedCircuit, allICs: Map<GUID, ProtoSchema.IntegratedCircuit>) {
        const id = ConvertId(ic.metadata!.metadata!.id);

        // If IC already added, skip
        if (circuit.getIC(id))
            return;

        // Find IC dependencies and load them first
        const dependencies = new Set(ic.components.map((c) => c.icId).filter((id) => id !== undefined).map(ConvertId));
        for (const depId of dependencies)
            SetIC(circuit, allICs.get(depId)!, allICs);

        // Create the IC circuit
        const icCircuit = CreateCircuit(id);

        icCircuit.beginTransaction({ batch: true });

        // Import dependencies
        icCircuit.importICs(circuit.getICs());

        // Load metadata
        icCircuit.name = ic.metadata!.metadata!.name;
        icCircuit.desc = ic.metadata!.metadata!.desc;
        icCircuit.thumbnail = ic.metadata!.metadata!.thumb;

        // Load objects
        const compIdMap = SetObjects(icCircuit, ic);

        icCircuit.commitTransaction();

        circuit.createIC({
            circuit: icCircuit,
            display: {
                size: V(ic.metadata!.displayWidth, ic.metadata!.displayHeight),
                pins: ic.metadata!.pins.map((p) => {
                    // Get internal port ID
                    const internalComp = icCircuit.getComponent(compIdMap.get(p.internalCompIdx)!)!;
                    const port = internalComp.allPorts[0];

                    return ({
                        id:    port.id,
                        group: p.group,
                        name:  p.name,
                        pos:   V(p.x, p.y),
                        dir:   V(p.dx, p.dy),
                    });
                }),
            },
        }, id);
    }


    if (!proto.metadata)
        throw new Error(`ProtoToSchema: Failed to find metadata! ${proto}`);

    const circuit = mainCircuit;

    circuit.beginTransaction({ batch: true });

    // Load metadata
    circuit.name = proto.metadata.name;
    circuit.desc = proto.metadata.desc;
    circuit.thumbnail = proto.metadata.thumb;

    // TODODOTOTOTO: Camera

    // Load ICs
    // This is mildly complicated because we need to load them in order of dependencies.
    // I.e., if we have IC 1, and IC 2 that contains an instance of IC 1,
    // we need to load IC 1 first.
    const icMap = new Map(
        proto.ics.map((ic) => [ConvertId(ic.metadata!.metadata!.id), ic]));
    for (const ic of proto.ics)
        SetIC(circuit, ic, icMap);

    // Load objects
    SetObjects(circuit, proto);

    circuit.commitTransaction();

    return circuit;
}
