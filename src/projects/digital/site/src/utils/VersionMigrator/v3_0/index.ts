/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable sonarjs/prefer-single-boolean-return */
/* eslint-disable sonarjs/no-small-switch */
/* eslint-disable key-spacing */

// Migration logic for old circuit files, version <= 3.0
import {Signal} from "digital/api/circuit/schema/Signal";
import {DigitalSchema} from "digital/api/circuit/schema";
import {Schema} from "shared/api/circuit/schema";
import {IMPORT_IC_CLOCK_MESSAGE} from "../../Constants";
import {uuid} from "shared/api/circuit/public";
import {Get} from "shared/api/circuit/utils/Reducers";
import {MapObj} from "shared/api/circuit/utils/Functions";
import * as V3_0Schema from "./Schema";
import {Decompress, Entry, MakeEntry} from "./SerialeazyUtils";


enum Warnings {
    ClockInIC,
}

export function IsV3_0(json: any): json is V3_0Schema.Circuit {
    return ("contents" in json && "metadata" in json);
}

function ConvertCompProps(
    comp: Entry<V3_0Schema.DigitalComponent>,
    i: number,
): Schema.Component["props"] {
    const props: Schema.Component["props"] = { zIndex: i };

    if (comp.name.set)
        props["name"] = comp.name.name;
    props["x"] = comp.transform.pos.x / 50;
    props["y"] = comp.transform.pos.y / -50;
    props["angle"] = comp.transform.angle;

    // Component-specific properties
    switch (comp.type) {
        case "ConstantNumber":
            props["inputNum"] = comp["inputNum"] as number;
            break;
        case "Clock":
            props["paused"] = comp["paused"] as boolean;
            props["delay"]  = comp["frequency"] as number;
            break;
        case "LED":
            props["color"] = comp["color"] as string;
            break;
        case "ASCIIDisplay":
        case "BCDDisplay":
            props["segmentCount"] = comp["segmentCount"] as number;
            break;
        case "Oscilloscope":
            props["paused"]  = comp["paused"] as boolean;
            props["delay"]   = comp["frequency"] as number;
            props["w"]       = (comp["displaySize"] as V3_0Schema.Vector).x / 50;
            props["h"]       = (comp["displaySize"] as V3_0Schema.Vector).y / 50;
            props["samples"] = comp["numSamples"] as number;
            break;
        case "Label":
            props["bgColor"]   = comp["color"] as string;
            props["textColor"] = comp["textColor"] as string;
            break;
    }

    return props;
}

function ConvertWireProps(wire: Entry<V3_0Schema.DigitalWire>, i: number): Schema.Wire["props"] {
    const props: Schema.Component["props"] = { zIndex: i };

    if (wire.name.set)
        props["name"] = wire.name.name;
    props["color"] = wire["color"] as string;

    return props;
}

function ConvertComponent(
    comp: Entry<V3_0Schema.DigitalComponent>,
    i: number,
    refToICIDMap: Record<string, Schema.GUID>,
): [Schema.Component, Entry<V3_0Schema.DigitalComponent>] {
    return [{
        baseKind: "Component",
        kind:     comp.type,
        id:       uuid(),
        icId:     (comp.type === "IC" ? refToICIDMap[(comp["data"] as Entry<V3_0Schema.ICData>).ref] : undefined),
        props:    ConvertCompProps(comp, i),
    }, comp];
}

function ConvertPort(
    port: Entry<V3_0Schema.DigitalPort>,
    parent: Schema.GUID,
    group: string,
    index: number,
): [Schema.Port, Entry<V3_0Schema.DigitalPort>] {
    return [{
        baseKind: "Port",
        kind:     "DigitalPort",
        id:       uuid(),
        props:    { "name": port.name },

        parent, group, index,
    }, port];
}

function ConvertWire(
    wire: Entry<V3_0Schema.DigitalWire>,
    i: number,
    refToPortsMap: Record<string, Schema.Port>,
): [Schema.Wire, Entry<V3_0Schema.DigitalWire>] {
    return [{
        baseKind: "Wire",
        kind:     "DigitalWire",
        id:       uuid(),
        props:    ConvertWireProps(wire, i),

        p1: refToPortsMap[wire.p1.ref].id,
        p2: refToPortsMap[wire.p2.ref].id,
    }, wire];
}

function ConvertPorts(
    comp: Entry<V3_0Schema.DigitalComponent>,
    parentId: Schema.GUID,
): Array<[Schema.Port, Entry<V3_0Schema.DigitalPort>]> {
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
        return [
            ConvertPort(inputs[0],  parentId, "pre",  0),
            ConvertPort(inputs[1],  parentId, "clr",  0),
            ...inputs.slice(2).map((port, i) => ConvertPort(port, parentId, FLIP_FLOP_GROUPS[comp.type][i], 0)),
            ConvertPort(outputs[0], parentId, "Q",    0),
            ConvertPort(outputs[1], parentId, "Qinv", 0),
        ];
    case "SRLatch":
    case "DLatch":
        const LATCH_GROUPS: Record<string, string[]> = {
            "SRLatch": ["S", "E", "R"],
            "DLatch":  ["D", "E"],
        }
        return [
            ...inputs.map((port, i) => ConvertPort(port, parentId, LATCH_GROUPS[comp.type][i], 0)),
            ConvertPort(outputs[0], parentId, "Q",    0),
            ConvertPort(outputs[1], parentId, "Qinv", 0),
        ];
    case "Multiplexer":
    case "Demultiplexer":
        const selects = (comp["selects"] as Entry<V3_0Schema.PortSet>).currentPorts;
        return [
            ...selects.map((port, i) => ConvertPort(port, parentId, "selects", i)),
            ... inputs.map((port, i) => ConvertPort(port, parentId, "inputs",  i)),
            ...outputs.map((port, i) => ConvertPort(port, parentId, "outputs", i)),
        ];
    case "Comparator":
        return [
            ...inputs.slice(0, inputs.length/2).map((port, i) => ConvertPort(port, parentId, "inputsA", i)),
            ...inputs.slice(inputs.length/2)   .map((port, i) => ConvertPort(port, parentId, "inputsB", i)),
            ConvertPort(outputs[0], parentId, "lt", 0),
            ConvertPort(outputs[1], parentId, "eq", 0),
            ConvertPort(outputs[2], parentId, "gt", 0),
        ];
    default:
        return [
            ... inputs.map((port, i) => ConvertPort(port, parentId, "inputs",  i)),
            ...outputs.map((port, i) => ConvertPort(port, parentId, "outputs", i)),
        ];
    }
}

function ConvertObjects(
    compEntries: Array<Entry<V3_0Schema.DigitalComponent>>,
    wireEntries: Array<Entry<V3_0Schema.DigitalWire>>,
    refToICIDMap: Record<string, Schema.GUID>,
) {
    // Convert all components to Schema
    const components = compEntries.map((c, i) => ConvertComponent(c, i, refToICIDMap));

    // Convert all ports to Schema
    const ports = components.flatMap(([comp, entry]) => ConvertPorts(entry, comp.id));
    const refToPortsMap = Object.fromEntries(ports.map(([port, entry]) => [entry.ref, port]));

    // Convert all wires to Schema
    const wires = wireEntries.map((w, i) => ConvertWire(w, i, refToPortsMap));

    return { components, ports, wires };
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
    id: Schema.GUID,
    group: string, { x: w, y: h }: Entry<V3_0Schema.Vector>,
): Schema.IntegratedCircuitPin {
    return {
        id, group,
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
    warnings: Set<Warnings>,
): [{ metadata: Schema.IntegratedCircuitMetadata } & ReturnType<typeof ConvertObjects>, Entry<V3_0Schema.ICData>] {
    const { components, ports, wires } = ConvertObjects(ic.collection.components, ic.collection.wires, refToICIDMap);
    const refToPortsMap = Object.fromEntries(ports.map(([port, entry]) => [entry.ref, port]));

    const inputPins = ic.collection.inputs
        .map((obj, i) => [refToPortsMap[obj.outputs.currentPorts[0].ref].id, ic.inputPorts[i]] as const)
        .map(([id, port]) => ConvertICPin(port, id, "inputs", ic.transform.size));
    const outputPins = ic.collection.outputs
        .map((obj, i) => [refToPortsMap[obj.inputs.currentPorts[0].ref].id, ic.outputPorts[i]] as const)
        .map(([id, port]) => ConvertICPin(port, id, "outputs", ic.transform.size));

    for (const [c, _] of components) {
        // Replace all Switch/Buttons with InputPins and LEDs with OutputPins
        if (c.kind === "Switch" || c.kind === "Button")
            c.kind = "InputPin";
        if (c.kind === "LED")
            c.kind = "OutputPin";

        // Clocks in ICs are no longer supported, change to a switch and add to warnings.
        if (c.kind === "Clock") {
            c.kind = "Switch";
            warnings.add(Warnings.ClockInIC);
        }
    }

    return [{
        metadata: {
            id:      refToICIDMap[ic.ref],
            name:    ic.name,
            desc:    "",
            thumb:   "",
            version: "digital/v0",

            displayWidth:  ic.transform.size.x/50,
            displayHeight: ic.transform.size.y/50,

            pins: [...inputPins, ...outputPins],
        } satisfies Schema.IntegratedCircuitMetadata,
        components, ports, wires,
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

function ConvertSimState(
    components: Array<[Schema.Component, Entry<V3_0Schema.DigitalComponent>]>,
    ports: Array<[Schema.Port, Entry<V3_0Schema.DigitalPort>]>,
    refToICIDMap: Record<string, Schema.GUID>,
    refToICsMap: Record<string, ReturnType<typeof ConvertIC>>,
): DigitalSchema.DigitalSimState {
    const signals = Object.fromEntries(ports.map(([port, entry]) => [port.id, Signal.fromBool(entry.isOn)]));

    const states = Object.fromEntries(components
        .map(([comp, entry]) => [comp.id, ConvertCompState(entry).map(Signal.fromBool)])
        .filter(([_, state]) => (state.length > 0)));

    const icStates = Object.fromEntries(components
        .filter(([comp, _]) => (comp.kind === "IC"))
        .map(([comp, entry]) => {
            const collection = entry["collection"] as Entry<V3_0Schema.DigitalObjectSet>;

            // The IC instance's collection is an independent copy of the ICData's collection
            // So when we convert it over, it'll generate new UUIDs, which is wrong, because
            // we need the original ICData's Schema UUIDs.
            // What we can do is convert it, and then associate the entries with the ICData's
            // Schema.
            // However, collections aren't guaranteed to be in the same order (frustratingly),
            // so we need to sort them by something stable.
            const icDataObjs = refToICsMap[(entry["data"] as Entry<V3_0Schema.ICData>).ref][0];
            const icObjs = ConvertObjects(collection.components, collection.wires, refToICIDMap);

            if (icDataObjs.components.length !== icObjs.components.length || icDataObjs.ports.length !== icObjs.ports.length)
                throw new Error(`Invariant failed! ${entry.name} doesn't have a proper connection to ICData!`);

            // This technically will _not_ work if there are exactly overlapping components with the same names
            // and such, but oh well. A real solution would involve building graphs of each.
            const compareComps = (c1: Entry<V3_0Schema.DigitalComponent>, c2: Entry<V3_0Schema.DigitalComponent>) => (
                (c1.type.localeCompare(c2.type)) ||
                (c1.name.name.localeCompare(c2.name.name) ||
                (c1.transform.pos.x - c2.transform.pos.x) ||
                (c1.transform.pos.y - c2.transform.pos.y))
            );
            const comparePorts = (c1: Entry<V3_0Schema.DigitalPort>, c2: Entry<V3_0Schema.DigitalPort>) => (
                (compareComps(c1.parent, c2.parent)) ||
                (c1.name.localeCompare(c2.name) ||
                (c1.target.x - c2.target.x) ||
                (c1.target.y - c2.target.y))
            );

            const components = icDataObjs.components
                .sort(([_, e1], [__, e2]) => compareComps(e1, e2))
                .map(Get(0))
                .zip(icObjs.components
                    .sort(([_, e1], [__, e2]) => compareComps(e1, e2))
                    .map(Get(1)));
            const ports = icDataObjs.ports
                .sort(([_, e1], [__, e2]) => comparePorts(e1, e2))
                .map(Get(0))
                .zip(icObjs.ports
                    .sort(([_, e1], [__, e2]) => comparePorts(e1, e2))
                    .map(Get(1)));

            return [comp.id, ConvertSimState(components, ports, refToICIDMap, refToICsMap)];
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
    const allICIDsMap = MapObj(allICEntriesMap, (_) => uuid());
    // Map of any ICData ref -> to the proper IC ID, duped ICData's will all point to the same ID.
    const refToICIDMap = MapObj(allICIDsMap, ([ref, _]) => allICIDsMap[icRefToRefMap[ref]]);

    const allICsMap = MapObj(allICEntriesMap, ([_, entry]) => ConvertIC(entry, refToICIDMap, warnings));
    // Map of any ICData -> IC Schema, duped ICData's will all point to the same Schema.
    const refToICsMap = MapObj(allICsMap, ([ref, _]) => allICsMap[icRefToRefMap[ref]]);


    const ics = [...new Set(Object.values(refToICsMap))];
    const { components, wires, ports } = ConvertObjects(root.designer.objects, root.designer.wires, refToICIDMap);

    const initialICSimStates = ics.map(([ic, _]) =>
        ConvertSimState(ic.components, ic.ports, refToICIDMap, refToICsMap));
    const simState = ConvertSimState(components, ports, refToICIDMap, refToICsMap);

    return {
        schema: {
            metadata: {
                id:      Schema.uuid(),
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

            ics: ics.map(Get(0)).map(({ metadata, components, ports, wires }) => ({
                metadata,
                objects: [...components.map(Get(0)), ...wires.map(Get(0)), ...ports.map(Get(0))],
            })),
            objects: [...components.map(Get(0)), ...wires.map(Get(0)), ...ports.map(Get(0))],

            propagationTime: root.designer.propagationTime,

            initialICSimStates,
            simState,
        } satisfies DigitalSchema.DigitalCircuit,
        warnings: [...warnings].map((w) => ({
            [Warnings.ClockInIC]: IMPORT_IC_CLOCK_MESSAGE,
        }[w])),
    }
}
