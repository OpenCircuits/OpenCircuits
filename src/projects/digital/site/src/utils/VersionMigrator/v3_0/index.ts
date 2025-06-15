/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable sonarjs/prefer-single-boolean-return */
/* eslint-disable sonarjs/no-small-switch */
/* eslint-disable key-spacing */

// Migration logic for old circuit files, version <= 3.0
import * as uuid from "uuid";

import {IMPORT_IC_CLOCK_MESSAGE} from "../../Constants";
import {GUID} from "shared/api/circuit/public";
import {Get} from "shared/api/circuit/utils/Reducers";
import {MapObj} from "shared/api/circuit/utils/Functions";
import * as V3_0Schema from "./Schema";
import {Decompress, Entry, MakeEntry} from "./SerialeazyUtils";
import {ProtoSchema} from "shared/site/proto";
import {DigitalProtoSchema} from "digital/site/proto";
import {DigitalKindMaps} from "digital/site/proto/bridge";


enum Warnings {
    ClockInIC,
}

export function IsV3_0(json: any): json is V3_0Schema.Circuit {
    return ("contents" in json && "metadata" in json);
}

function ConvertId(id: GUID): Uint8Array {
    return uuid.parse(id) as Uint8Array;
}

function ConvertCompProps(
    comp: Entry<V3_0Schema.DigitalComponent>,
): ProtoSchema.Component["otherProps"] {
    const props: ProtoSchema.Component["otherProps"] = {};

    // Component-specific properties
    switch (comp.type) {
        case "ConstantNumber":
            props["inputNum"] = { intVal: comp["inputNum"] as number };
            break;
        case "Clock":
            props["paused"] = { boolVal: comp["paused"] as boolean };
            props["delay"]  = { intVal: comp["frequency"] as number };
            break;
        case "LED":
            props["color"] = { strVal: comp["color"] as string };
            break;
        case "ASCIIDisplay":
        case "BCDDisplay":
            props["segmentCount"] = { intVal: comp["segmentCount"] as number };
            break;
        case "Oscilloscope":
            props["paused"]  = { boolVal: comp["paused"] as boolean };
            props["delay"]   = { intVal: comp["frequency"] as number };
            props["w"]       = { floatVal: (comp["displaySize"] as V3_0Schema.Vector).x / 50 };
            props["h"]       = { floatVal: (comp["displaySize"] as V3_0Schema.Vector).y / 50 };
            props["samples"] = { intVal: comp["numSamples"] as number };
            break;
        case "Label":
            props["bgColor"]   = { strVal: comp["color"] as string };
            props["textColor"] = { strVal: comp["textColor"] as string };
            break;
    }

    return props;
}

function ConvertPort(
    port: Entry<V3_0Schema.DigitalPort>,
    group: string,
    index: number,
): [ProtoSchema.Port, Entry<V3_0Schema.DigitalPort>] {
    return [{
        group, index,
        name: (port.name ?? undefined),
        otherProps: {},
    }, port];
}

function FindPorts(
    comp: Entry<V3_0Schema.DigitalComponent>
): { cfgIdx: number, ports: Array<[ProtoSchema.Port, Entry<V3_0Schema.DigitalPort>]> } {
    const inputs = comp.inputs.currentPorts, outputs = comp.outputs.currentPorts;
    switch (comp.type) {
    // Flip flops, latches, muxes, and comparator don't have the same exact input/output ordering,
    //  so manually set them
    case "SRFlipFlop":
    case "JKFlipFlop":
    case "DFlipFlop":
    case "TFlipFlop":
        const FLIP_FLOP_GROUPS: Record<string, string[]> = {
            "SRFlipFlop": ["S", "clk", "R"],
            "JKFlipFlop": ["J", "clk", "K"],
            "DFlipFlop":  ["D", "clk"],
            "TFlipFlop":  ["T", "clk"],
        }
        return {
            cfgIdx: 0,
            ports: [
                ConvertPort(inputs[0], "pre",  0),
                ConvertPort(inputs[1], "clr",  0),
                ...inputs.slice(2).map((port, i) => ConvertPort(port, FLIP_FLOP_GROUPS[comp.type][i], 0)),
                ConvertPort(outputs[0], "Q",    0),
                ConvertPort(outputs[1], "Qinv", 0),
            ],
        };
    case "SRLatch":
    case "DLatch":
        const LATCH_GROUPS: Record<string, string[]> = {
            "SRLatch": ["S", "E", "R"],
            "DLatch":  ["D", "E"],
        }
        return {
            cfgIdx: 0,
            ports: [
                ...inputs.map((port, i) => ConvertPort(port, LATCH_GROUPS[comp.type][i], 0)),
                ConvertPort(outputs[0], "Q",    0),
                ConvertPort(outputs[1], "Qinv", 0),
            ],
        };
    case "Multiplexer":
    case "Demultiplexer":
        const selects = (comp["selects"] as Entry<V3_0Schema.PortSet>).currentPorts;
        return {
            cfgIdx: selects.length - 1,
            ports: [
                ...selects.map((port, i) => ConvertPort(port, "selects", i)),
                ... inputs.map((port, i) => ConvertPort(port, "inputs",  i)),
                ...outputs.map((port, i) => ConvertPort(port, "outputs", i)),
            ],
        };
    case "Comparator":
        return {
            cfgIdx: inputs.length/2 - 1,
            ports: [
                ...inputs.slice(0, inputs.length/2).map((port, i) => ConvertPort(port, "inputsA", i)),
                ...inputs.slice(inputs.length/2)   .map((port, i) => ConvertPort(port, "inputsB", i)),
                ConvertPort(outputs[0], "lt", 0),
                ConvertPort(outputs[1], "eq", 0),
                ConvertPort(outputs[2], "gt", 0),
            ],
        };
    }

    // Everything else has just inputs/outputs, but the config index changes
    const ports = [
        ... inputs.map((port, i) => ConvertPort(port, "inputs",  i)),
        ...outputs.map((port, i) => ConvertPort(port, "outputs", i)),
    ];
    const cfgIdx = (() => {
        switch (comp.type) {
        case "Encoder":
            return outputs.length - 1;
        case "ANDGate":
        case "NANDGate":
        case "ORGate":
        case "NORGate":
        case "XORGate":
        case "XNORGate":
            return inputs.length - 2;
        case "SegmentDisplay":
            return {
                7: 0,
                9: 1,
                14: 2,
                16: 3,
            }[inputs.length] ?? 0;
        case "Decoder":
        case "Oscilloscope":
            return inputs.length - 1;
        default:
            return 0;
        }
    })();

    return { cfgIdx, ports };
}

function ConvertCompKind(str: string): number {
    if (!DigitalKindMaps[0].compKinds.has(str))
        throw new Error(`VersionMigratorv3_0: Unknown kind, ${str}!`);
    return DigitalKindMaps[0].compKinds.get(str)!;
}

function ConvertComponent(
    comp: Entry<V3_0Schema.DigitalComponent>,
    refToICIDMap: Record<string, GUID>,
    allICIDs: GUID[],
): [ProtoSchema.Component, Entry<V3_0Schema.DigitalComponent>, Array<[ProtoSchema.Port, Entry<V3_0Schema.DigitalPort>]>] {
    const { cfgIdx, ports } = FindPorts(comp);

    const icId = (comp.type === "IC" ? refToICIDMap[(comp["data"] as Entry<V3_0Schema.ICData>).ref] : undefined);

    return [{
        kind:  ConvertCompKind(comp.type),
        icIdx: (icId ? allICIDs.indexOf(icId) : undefined),

        portConfigIdx: cfgIdx,

        name:  comp.name.set ? comp.name.name : undefined,
        x:     comp.transform.pos.x / 50,
        y:     comp.transform.pos.y / -50,
        angle: comp.transform.angle,

        otherProps: ConvertCompProps(comp),
        portOverrides: ports.map(([p, _]) => p).filter((p) => (!!p.name)),
    }, comp, ports];
}

function ConvertWire(
    wire: Entry<V3_0Schema.DigitalWire>,
    componentsAndPorts: Array<ReturnType<typeof ConvertComponent>>,
): [ProtoSchema.Wire, Entry<V3_0Schema.DigitalWire>] {
    const p1ParentIdx = componentsAndPorts.findIndex(([_, p]) => (p.ref === wire.p1.parent.ref));
    const p2ParentIdx = componentsAndPorts.findIndex(([_, p]) => (p.ref === wire.p2.parent.ref));

    const [_p1, _p1ParentEntry, p1Ports] = componentsAndPorts[p1ParentIdx];
    const [_p2, _p2ParentEntry, p2Ports] = componentsAndPorts[p2ParentIdx];

    const [port1, _port1Entry] = p1Ports.find(([_, p]) => (p.ref === wire.p1.ref))!;
    const [port2, _port2Entry] = p2Ports.find(([_, p]) => (p.ref === wire.p2.ref))!;

    return [{
        p1ParentIdx,
        p1Group: port1.group,
        p1Idx:   port1.index,

        p2ParentIdx,
        p2Group: port2.group,
        p2Idx:   port2.index,

        name:  (wire.name.set ? wire.name.name : undefined),
        color: ("color" in wire && wire["color"] ? parseInt((wire["color"] as string).slice(1), 16) : undefined),

        otherProps: {},
    }, wire];
}

function ConvertObjects(
    compEntries: Array<Entry<V3_0Schema.DigitalComponent>>,
    wireEntries: Array<Entry<V3_0Schema.DigitalWire>>,
    refToICIDMap: Record<string, GUID>,
    allICIDs: GUID[],
) {
    // Convert all components to Schema
    const componentsAndPorts = compEntries.map((c) => ConvertComponent(c, refToICIDMap, allICIDs));

    // Convert all wires to Schema
    const wires = wireEntries.map((w) => ConvertWire(w, componentsAndPorts));

    return { componentsAndPorts, wires };
}

function AreICDataEqual(i1: V3_0Schema.ICData, i2: V3_0Schema.ICData) {
    if (i1.name !== i2.name)
        return false;
    if (i1.inputPorts.length !== i2.inputPorts.length)
        return false;
    if (i1.outputPorts.length !== i2.outputPorts.length)
        return false;
    if (i1.collection.components.length !== i2.collection.components.length)
        return false;
    if (i1.collection.wires.length !== i2.collection.wires.length)
        return false;
    if (i1.collection.others.length !== i2.collection.others.length)
        return false;
    if (i1.collection.inputs.length !== i2.collection.inputs.length)
        return false;
    if (i1.collection.outputs.length !== i2.collection.outputs.length)
        return false;
    return true;
}

function ConvertICPin(
    port: Entry<V3_0Schema.DigitalPort>,
    internalCompIdx: number,
    group: string, { x: w, y: h }: Entry<V3_0Schema.Vector>,
): ProtoSchema.IntegratedCircuitMetadata_Pin {
    return {
        internalCompIdx,
        internalPortIdx: 0,

        group,
        name: port.name,

        x:  port.origin.x / (w / 2),
        y:  -port.origin.y / (h / 2),
        dx: port.dir.x,
        dy: -port.dir.y,
    };
}

function ConvertIC(
    ic: Entry<V3_0Schema.ICData>,
    refToICIDMap: Record<string, string>,
    allICIDs: GUID[],
    warnings: Set<Warnings>,
): [{ metadata: ProtoSchema.IntegratedCircuitMetadata } & ReturnType<typeof ConvertObjects>, Entry<V3_0Schema.ICData>] {
    const { componentsAndPorts, wires } = ConvertObjects(ic.collection.components, ic.collection.wires, refToICIDMap, allICIDs);

    const inputPins = ic.collection.inputs
        .map((obj, i) => [
            componentsAndPorts.findIndex(([_, parent]) => (parent.ref === obj.ref)),
            ic.inputPorts[i],
        ] as const)
        .map(([internalCompIdx, port]) => ConvertICPin(port, internalCompIdx, "inputs", ic.transform.size));
    const outputPins = ic.collection.outputs
        .map((obj, i) => [
            componentsAndPorts.findIndex(([_, parent]) => (parent.ref === obj.ref)),
            ic.outputPorts[i],
        ] as const)
        .map(([internalCompIdx, port]) => ConvertICPin(port, internalCompIdx, "outputs", ic.transform.size));

    for (const [c, entry] of componentsAndPorts) {
        // Replace all Switch/Buttons with InputPins and LEDs with OutputPins
        if (entry.type === "Switch" || entry.type === "Button")
            c.kind = ConvertCompKind("InputPin");
        if (entry.type === "LED") {
            c.kind = ConvertCompKind("OutputPin");
            delete c.otherProps["color"];
        }

        // Clocks in ICs are no longer supported, change to a switch and add to warnings.
        if (entry.type === "Clock") {
            c.kind = ConvertCompKind("Switch");
            delete c.otherProps["paused"];
            delete c.otherProps["delay"];
            warnings.add(Warnings.ClockInIC);
        }
    }

    return [{
        metadata: {
            metadata: {
                id:      ConvertId(refToICIDMap[ic.ref]),
                name:    ic.name,
                desc:    "",
                thumb:   "",
                version: "digital/v0",
            },

            displayWidth:  ic.transform.size.x/50,
            displayHeight: ic.transform.size.y/50,

            pins: [...inputPins, ...outputPins],
        } satisfies ProtoSchema.IntegratedCircuitMetadata,
        componentsAndPorts, wires,
    }, ic] as const;
}

function ConvertCompState(comp: Entry<V3_0Schema.DigitalComponent>): boolean[] {
    switch (comp.type) {
    case "Switch":
        return [comp["isOn"] as boolean];
    case "SRFlipFlop":
    case "JKFlipFlop":
    case "DFlipFlop":
    case "TFlipFlop":
        return [comp["state"] as boolean, comp["lastClock"] as boolean];
    case "SRLatch":
    case "DLatch":
        return [comp["state"] as boolean];
    default:
        return [];
    }
}

function ConvertSignal(signal: boolean): DigitalProtoSchema.DigitalSimState_Signal {
    return (signal ? DigitalProtoSchema.DigitalSimState_Signal.On : DigitalProtoSchema.DigitalSimState_Signal.Off);
}

function ConvertSimState(
    componentsAndPorts: Array<[ProtoSchema.Component, Entry<V3_0Schema.DigitalComponent>, Array<[ProtoSchema.Port, Entry<V3_0Schema.DigitalPort>]>]>,
    refToICIDMap: Record<string, GUID>,
    refToICsMap: Record<string, ReturnType<typeof ConvertIC>>,
    allICIDs: GUID[],
): DigitalProtoSchema.DigitalSimState {
    const signals = componentsAndPorts.flatMap(([_, _e, ports]) =>
        ports.map(([_p, portEntry]) => ConvertSignal(portEntry.isOn)));

    const states = Object.fromEntries(componentsAndPorts
        .map(([_, entry], i) => [i, { state: ConvertCompState(entry).map(ConvertSignal) }] as const)
        .filter(([_, { state }]) => (state.length > 0)));

    const icStates = Object.fromEntries(componentsAndPorts
        .map((compAndPort, i) => [i, compAndPort] as const)
        .filter(([_i, [_comp, entry]]) => (entry.type === "IC"))
        .map(([i, [_comp, entry]]) => {
            const collection = entry["collection"] as Entry<V3_0Schema.DigitalObjectSet>;

            // The IC instance's collection is an independent copy of the ICData's collection
            // So when we convert it over, it'll generate new UUIDs, which is wrong, because
            // we need the original ICData's Schema UUIDs.
            // What we can do is convert it, and then associate the entries with the ICData's
            // Schema.
            // However, collections aren't guaranteed to be in the same order (frustratingly),
            // so we need to sort them by something stable.
            const icDataObjs = refToICsMap[(entry["data"] as Entry<V3_0Schema.ICData>).ref][0];
            const icObjs = ConvertObjects(collection.components, collection.wires, refToICIDMap, allICIDs);

            // This technically will _not_ work if there are exactly overlapping components with the same names
            // and such, but oh well. A real solution would involve building graphs of each.
            const compareComps = (c1: Entry<V3_0Schema.DigitalComponent>, c2: Entry<V3_0Schema.DigitalComponent>) => (
                (c1.type.localeCompare(c2.type)) ||
                (c1.name.name.localeCompare(c2.name.name) ||
                (c1.transform.pos.x - c2.transform.pos.x) ||
                (c1.transform.pos.y - c2.transform.pos.y))
            );

            const componentsAndPorts = icDataObjs.componentsAndPorts
                // Need the original indices, to sort back to the original order
                .map(([comp, entry, ports], i) => [i, comp, entry, ports] as const)
                .sort(([_i1, _c1, e1], [_i2, _c2, e2]) => compareComps(e1, e2))
                .zip(icObjs.componentsAndPorts
                    .sort(([_c1, e1], [_c2, e2]) => compareComps(e1, e2)))
                .sort(([[i1]], [[i2]]) => (i1 - i2))
                .map(([[_i, comp1, _e1, _ports1], [_comp2, e2, ports2]]) =>
                    [comp1, e2, ports2] satisfies [ProtoSchema.Component, Entry<V3_0Schema.DigitalComponent>, Array<[ProtoSchema.Port, Entry<V3_0Schema.DigitalPort>]>])

            return [i, ConvertSimState(componentsAndPorts, refToICIDMap, refToICsMap, allICIDs)];
        }));

    return { signals, states, icStates };
}

export function V3_0Migrator(circuit: V3_0Schema.Circuit) {
    const contents = Decompress(JSON.parse(circuit.contents));
    const root = MakeEntry<V3_0Schema.ContentsData>(contents, "0");

    const warnings: Set<Warnings> = new Set();

    // Gather all ICs from contents:
    // Can't just use root.designer.ics, because some old circuits have ICs hidden within other ICs
    // Instead, we can just find all "ICData" references in the entire file.
    const allICEntriesMap: Record<string, Entry<V3_0Schema.ICData>> = Object.fromEntries(Object.entries(contents)
        .filter(([_, entry]) => entry.type === "ICData")
        .map(([ref, _]) => [ref, MakeEntry<V3_0Schema.ICData>(contents, ref)]));

    // We have to de-dupe ICs since for (unknown reason), there can be duplicate references
    // to the same ICData from an IC-Instance. To do that, refer each duplicate reference
    // to the collection of the first reference and use the same ID.
    const icRefToRefMap = MapObj(allICEntriesMap, ([ref, entry], i, arr) => {
        const result = Object.entries(arr).slice(0,i).find(([_ref2, entry2]) => AreICDataEqual(entry, entry2));
        if (!result)
            return ref;
        return result[0];
    });
    const allICIDsMap = MapObj(allICEntriesMap, (_) => uuid.v4());
    // Map of any ICData ref -> to the proper IC ID, duped ICData's will all point to the same ID.
    const refToICIDMap = MapObj(allICIDsMap, ([ref, _]) => allICIDsMap[icRefToRefMap[ref]]);
    const uniqueICIDs = [...new Set(Object.values(refToICIDMap))];

    const allICsMap = MapObj(allICEntriesMap, ([_, entry]) => ConvertIC(entry, refToICIDMap, uniqueICIDs, warnings));
    // Map of any ICData -> IC Schema, duped ICData's will all point to the same Schema.
    const refToICsMap = MapObj(allICsMap, ([ref, _]) => allICsMap[icRefToRefMap[ref]]);

    const ics = [...new Set(Object.values(refToICsMap))]
        // Make sure it's in the same index-order as `uniqueICIDs` since IC instances are index-dependent
        .sort(([_i1, e1], [_i2, e2]) => uniqueICIDs.indexOf(refToICIDMap[e1.ref]) - uniqueICIDs.indexOf(refToICIDMap[e2.ref]));
    const { componentsAndPorts, wires } = ConvertObjects(root.designer.objects, root.designer.wires, refToICIDMap, uniqueICIDs);

    const icInitialSimStates = ics.map(([ic, _]) =>
        ConvertSimState(ic.componentsAndPorts, refToICIDMap, refToICsMap, uniqueICIDs));
    const simState = ConvertSimState(componentsAndPorts, refToICIDMap, refToICsMap, uniqueICIDs);

    return {
        schema: {
            circuit: {
                metadata: {
                    id:      ConvertId(uuid.v4()),
                    name:    circuit.metadata.name,
                    desc:    "",
                    thumb:   "",
                    version: "digital/v0",
                },
                camera: {
                    x: root.camera.pos.x / 50,
                    y: root.camera.pos.y / -50,
                    zoom: root.camera.zoom / 50,
                },
                ics: ics.map(Get(0)).map(({ metadata, componentsAndPorts, wires }) => ({
                    metadata,

                    components: componentsAndPorts.map(Get(0)),
                    wires:      wires.map(Get(0)),
                })),
                components: componentsAndPorts.map(Get(0)),
                wires:      wires.map(Get(0)),
            },

            propagationTime: root.designer.propagationTime,

            icInitialSimStates,
            simState,
        } satisfies DigitalProtoSchema.DigitalCircuit,
        warnings: [...warnings].map((w) => ({
            [Warnings.ClockInIC]: IMPORT_IC_CLOCK_MESSAGE,
        }[w])),
    }
}
