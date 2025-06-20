/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable @typescript-eslint/no-unused-vars */
// This file has "bridge" functions from the internal rep (Circuit.Schema)
// to the wire rep (Circuit.proto) and vice versa.

import * as uuid from "uuid";

import {InvertRecord, MapObj}       from "shared/api/circuit/utils/Functions";
import {GUID, Schema} from "shared/api/circuit/schema";

import * as ProtoSchema from "./Circuit";
import {Circuit, Component, IntegratedCircuit, Obj, PortConfig, ReadonlyComponent, ReadonlyWire, Wire} from "shared/api/circuit/public";
import {V} from "Vector";
import {BaseObject} from "shared/api/circuit/public/BaseObject";
import {InvertMap} from "shared/api/circuit/utils/Map";


export interface CompConversionInfo {
    kind: number;
    ports: Record<string, number>;
}
export function MakeConversionMaps(
    comps: Record<string, CompConversionInfo>,
    wires: Record<string, number>,
    ports: Record<string, number>,
): [ForwardConversionInfo, BackwardConversionInfo] {
    function MakeAndCheckCompInfo(r: Record<string, CompConversionInfo>) {
        const kindsMap = new Map([...Object.entries(r)].map(([kind, info]) => [kind, info.kind]));
        if (new Set(kindsMap.values()).size !== kindsMap.size)
            throw new Error("Duplicate keys found in KindMap!");
        const portsMap = new Map([...Object.entries(r)].map(([kind, info]) => [kind, new Map(Object.entries(info.ports))]));
        return { kindsMap, portsMap };
    }

    const compInfo = MakeAndCheckCompInfo(comps);

    const forwardMap = {
        kinds: {
            comps: compInfo.kindsMap,
            wires: new Map(Object.entries(wires)),
            ports: new Map(Object.entries(ports)),
        },
        portGroups: compInfo.portsMap,
    };
    return [forwardMap, {
        kinds: {
            comps: InvertMap(forwardMap.kinds.comps),
            wires: InvertMap(forwardMap.kinds.wires),
            ports: InvertMap(forwardMap.kinds.ports),
        },
        portGroups: new Map([...forwardMap.portGroups.entries()].map(([kind, ports]) => [kind, InvertMap(ports)] as const)),
    }];
}


type ForwardConversionInfo = {
    kinds: {
        comps: Map<string, number>;
        wires: Map<string, number>;
        ports: Map<string, number>;
    };
    // Component kind : (Port group name : Port group ID)
    portGroups: Map<string, Map<string, number>>;
}
export function CircuitToProto(circuit: Circuit, conversionInfo: ForwardConversionInfo): ProtoSchema.Circuit {
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

    function ConvertComponent(c: ReadonlyComponent, ics: IntegratedCircuit[]): ProtoSchema.Component {
        const { name, isSelected, x, y, angle, zIndex, ...otherProps } = c.getProps()

        const matchesPortConfig = (pc: PortConfig) =>
            Object.entries(pc).every(([group, numPorts]) => c.ports[group]?.length === numPorts);

        const isDefaultPortConfig = matchesPortConfig(c.info.defaultPortConfig);
        const portConfigIdx = c.info.portConfigs.findIndex(matchesPortConfig);

        return {
            kind: conversionInfo.kinds.comps.get(c.isIC() ? "IC" : c.kind)!,

            icIdx: (c.isIC() ? ics.findIndex((ic) => ic.id === c.kind) : undefined),

            portConfigIdx: (isDefaultPortConfig || portConfigIdx === -1 ? undefined : portConfigIdx),

            name:  (name ? name as string : undefined),
            x:     (x ? Math.round(x as number * 100)/100 : undefined),
            y:     (y ? Math.round(y as number * 100)/100 : undefined),
            angle: (angle ? angle as number : undefined),

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
            }).filter((p) => (p.name || p.isSelected || Object.keys(p.otherProps).length > 0)),
        };
    }

    function GetPortGroups(c: ReadonlyComponent, ics: IntegratedCircuit[]): Map<string, number> {
        if (!c.isIC())
            return conversionInfo.portGroups.get(c.kind)!;
        const ic = ics.find((ic) => (ic.id === c.kind))!;
        return new Map([...new Set(ic.display.pins.map((p) => p.group))].map((g, i) => [g, i]));
    }

    function ConvertWire(w: ReadonlyWire, comps: ReadonlyComponent[], ics: IntegratedCircuit[]): ProtoSchema.Wire {
        const { name, isSelected, color, zIndex, ...otherProps } = w.getProps();

        return {
            kind: conversionInfo.kinds.wires.get(w.kind)!,

            p1ParentIdx: comps.findIndex((c) => c.id === w.p1.parent.id),
            p1Group:     GetPortGroups(w.p1.parent, ics)!.get(w.p1.group)!,
            p1Idx:       w.p1.index,

            p2ParentIdx: comps.findIndex((c) => c.id === w.p2.parent.id),
            p2Group:     GetPortGroups(w.p2.parent, ics)!.get(w.p2.group)!,
            p2Idx:       w.p2.index,

            name:  (name ? name as string : undefined),
            //     Convert color to hex integer
            color: (color ? parseInt((color as string).slice(1), 16) : undefined),

            otherProps: ConvertProps(otherProps),
        };
    }

    function ConvertMetadata(circuit: Circuit | IntegratedCircuit): ProtoSchema.CircuitMetadata {
        return {
            id:      circuit.id,
            name:    circuit.name,
            desc:    circuit.desc,
            version: "1.0/0",  // TODO: Update this to use the actual version
        };
    }

    function ConvertICMetadata(ic: IntegratedCircuit, components: ReadonlyComponent[]): ProtoSchema.IntegratedCircuitMetadata {
        const portGroups = Object.fromEntries([...new Set(ic.display.pins.map((p) => p.group))].map((g, i) => [g, i]));
        return {
            metadata: ConvertMetadata(ic),

            displayWidth:  ic.display.size.x,
            displayHeight: ic.display.size.y,

            portGroups,

            pins: ic.display.pins.map((p) => {
                const compIdx = components.findIndex((c) => (c.allPorts.find((port) => port.id === p.id)));
                const portIdx = components[compIdx].allPorts.findIndex((port) => port.id === p.id);
                return ({
                    internalCompIdx: compIdx,
                    internalPortIdx: portIdx,

                    group: portGroups[p.group],
                    name:  p.name,

                    x:  p.pos.x,
                    y:  p.pos.y,
                    dx: p.dir.x,
                    dy: p.dir.y,
                });
            }),
        };
    }

    function ConvertIC(ic: IntegratedCircuit, ics: IntegratedCircuit[]): ProtoSchema.IntegratedCircuit {
        const comps = ic.components.sort((c1, c2) => (c1.zIndex - c2.zIndex));
        const wires = ic.wires.sort((w1, w2) => (w1.zIndex, w2.zIndex));

        return {
            metadata:   ConvertICMetadata(ic, comps),
            components: comps.map((c) => ConvertComponent(c, ics)),
            wires:      wires.map((w) => ConvertWire(w, comps, ics)),
        };
    }

    // Sort by z-index
    const comps = circuit.getComponents().sort((c1, c2) => (c1.zIndex - c2.zIndex));
    const wires = circuit.getWires().sort((w1, w2) => (w1.zIndex, w2.zIndex));

    const ics = circuit.getICs();

    return ProtoSchema.Circuit.create({
        metadata: ConvertMetadata(circuit),
        camera:   {
            x:    circuit.camera.cx,
            y:    circuit.camera.cy,
            zoom: circuit.camera.zoom,
        },
        ics:        ics.map((ic) => ConvertIC(ic, ics)),
        components: comps.map((c) => ConvertComponent(c, ics)),
        wires:      wires.map((w) => ConvertWire(w, comps, ics)),
    });
}

type BackwardConversionInfo = {
    kinds: {
        comps: Map<number, string>;
        wires: Map<number, string>;
        ports: Map<number, string>;
    };
    // Component kind : (Port group ID : Port group name)
    portGroups: Map<string, Map<number, string>>;
}
export function ProtoToCircuit<C extends Circuit>(proto: ProtoSchema.Circuit, mainCircuit: C, CreateCircuit: (id: GUID) => C, conversionInfo: BackwardConversionInfo): C {
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

    function ConvertICIdx(idx: number | undefined, ics: ProtoSchema.IntegratedCircuit[]) {
        return (idx !== undefined ? ics[idx].metadata!.metadata!.id : undefined);
    }

    function GetPortGroups(c: Component, ics: ProtoSchema.IntegratedCircuit[]): Map<number, string> {
        const ic = ics.find((ic) => (ic.metadata!.metadata!.id === c.kind));
        if (!ic)
            return conversionInfo.portGroups.get(c.kind)!;
        return InvertMap(new Map(Object.entries(ic.metadata!.portGroups!)));
    }

    function SetObjects(circuit: Circuit, objs: { components: ProtoSchema.Component[], wires: ProtoSchema.Wire[] }, ics: ProtoSchema.IntegratedCircuit[]) {
        const compIdMap = new Map<number, GUID>();

        for (let i = 0; i < objs.components.length; i++) {
            const c = objs.components[i];

            const kind = conversionInfo.kinds.comps.get(c.kind)!;

            const comp = circuit.placeComponentAt(
                kind === "IC" ? ConvertICIdx(c.icIdx, ics)! : kind,
                V(c.x ?? 0, c.y ?? 0),
            );

            compIdMap.set(i, comp.id);

            // Load props
            comp.name = c.name;
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
                SetProps(port, p.otherProps);
            }
        }

        for (const w of objs.wires) {
            const p1Parent = circuit.getComponent(compIdMap.get(w.p1ParentIdx)!)!;
            const p1Group = GetPortGroups(p1Parent, ics)!.get(w.p1Group)!;
            const p1Port = p1Parent.ports[p1Group][w.p1Idx];

            const p2Parent = circuit.getComponent(compIdMap.get(w.p2ParentIdx)!)!;
            const p2Group = GetPortGroups(p2Parent, ics)!.get(w.p2Group)!;
            const p2Port = p2Parent.ports[p2Group][w.p2Idx];

            const wire = p1Port.connectTo(p2Port)!;

            // Load props
            wire.name = w.name;
            if (w.color !== undefined) // Convert color to hex string
                wire.setProp("color", `#${(w.color & 0xFF_FF_FF).toString(16).padStart(6, "0")}`);
            SetProps(wire, w.otherProps);
        }

        return compIdMap;
    }

    function SetIC(circuit: Circuit, ic: ProtoSchema.IntegratedCircuit, allICs: Map<GUID, ProtoSchema.IntegratedCircuit>, ics: ProtoSchema.IntegratedCircuit[]) {
        const id = ic.metadata!.metadata!.id;

        // If IC already added, skip
        if (circuit.getIC(id))
            return;

        // Find IC dependencies and load them first
        const dependencies = new Set(ic.components.map((c) => ConvertICIdx(c.icIdx, ics)).filter((id) => id !== undefined));
        for (const depId of dependencies)
            SetIC(circuit, allICs.get(depId)!, allICs, ics);

        // Create the IC circuit
        const icCircuit = CreateCircuit(id);

        icCircuit.beginTransaction({ batch: true });

        // Import dependencies
        icCircuit.importICs(circuit.getICs());

        // Load metadata
        icCircuit.name = ic.metadata!.metadata!.name;
        icCircuit.desc = ic.metadata!.metadata!.desc;

        // Load objects
        const compIdMap = SetObjects(icCircuit, ic, ics);

        icCircuit.commitTransaction();

        const portGroups = InvertRecord<string, number>(ic.metadata!.portGroups!);
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
                        group: portGroups[p.group],
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

    circuit.camera.cx = proto.camera?.x ?? 0;
    circuit.camera.cy = proto.camera?.y ?? 0;
    circuit.camera.zoom = proto.camera?.zoom ?? 0.02;

    // Load ICs
    // This is mildly complicated because we need to load them in order of dependencies.
    // I.e., if we have IC 1, and IC 2 that contains an instance of IC 1,
    // we need to load IC 1 first.
    const icMap = new Map(
        proto.ics.map((ic) => [ic.metadata!.metadata!.id, ic]));
    for (const ic of proto.ics)
        SetIC(circuit, ic, icMap, proto.ics);

    // Load objects
    SetObjects(circuit, proto, proto.ics);

    circuit.commitTransaction();

    return circuit;
}
