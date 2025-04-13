/* eslint-disable key-spacing */
import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {CreateCircuit} from "digital/api/circuit/public";
import {DigitalPort} from "digital/api/circuit/public/DigitalPort";
import {Schema} from "shared/api/circuit/schema";
import {V} from "Vector";


interface SerializationEntry {
    type: string;
    data: Record<string, unknown>;
}

type Ref = { ref: string };
function isRef(o: unknown): o is Ref {
    if (!o || typeof o !== "object")
        return false;
    return ("ref" in o);
}

type SerializationArrayEntry = {
    type: "Array";
    data: Array<Ref | SerializationEntry>;
}
function isSerializationArrayEntry(o: unknown): o is SerializationArrayEntry {
    if (!o || typeof o !== "object")
        return false;
    return ("type" in o && o.type === "Array" && "data" in o && Array.isArray(o.data));
}

export function VersionConflictResolver(fileContents: string): Schema.Circuit {
    const  [circuit, { sim }] = CreateCircuit();
    const oldCircuit = JSON.parse(fileContents);

    circuit.name = oldCircuit.metadata.name;
    const version = oldCircuit.metadata.version;
    if (version === "type/v0") {
        // TODO: Better validation
        return oldCircuit as Schema.Circuit;
    }
    const v = parseFloat(version);

    if (!oldCircuit.contents)
        return circuit.toSchema();

    const contents = JSON.parse(oldCircuit.contents) as Record<string, SerializationEntry>;

    // Utility func to get vector data through a ref or directly
    const getEntry = (parent: SerializationEntry, key: string) => {
        const v = parent["data"][key];
        if (!v)
            return;
        if (isRef(v))
            return contents[v["ref"]];
        return v as SerializationEntry;
    }
    const getArrayEntry = (parent: SerializationEntry, key: string) => {
        const v = parent["data"][key];
        if (!v)
            return;
        if (isSerializationArrayEntry(v))
            return v;
        if (isRef(v)) {
            const content = contents[v["ref"]];
            if (isSerializationArrayEntry(content)) {
                return content
            }
        }
    }
    const getArrayEntries = (parent: SerializationArrayEntry) => parent.data.map((entry) => (isRef(entry))
        ? {
            ref: entry.ref,
            obj: contents[entry.ref],
        }
        : {
            obj: entry,
        }
    );

    if (v < 2.1) {
        const transformations: Record<string, Array<{ports: string, positioner: string}>> = {
            "Multiplexer":    [{ ports: "inputs",  positioner: "ConstantSpacePositioner" },
                               { ports: "outputs", positioner: "Positioner" }],
            "Demultiplexer":  [{ ports: "outputs", positioner: "ConstantSpacePositioner" },
                               { ports: "inputs",  positioner: "Positioner" }],
            "ANDGate":        [{ ports: "inputs",  positioner: "Positioner" }],
            "NANDGate":       [{ ports: "inputs",  positioner: "Positioner" }],
            "SegmentDisplay": [{ ports: "inputs",  positioner: "ConstantSpacePositioner" }],
            "SRFlipFlop":     [{ ports: "inputs",  positioner: "FlipFlopPositioner" }],
            "JKFlipFlop":     [{ ports: "inputs",  positioner: "FlipFlopPositioner" }],
            "SRLatch":        [{ ports: "inputs",  positioner: "Positioner" }],
        };

        Object.values(contents).forEach(({ type, data }) => {
            const transformation = transformations[type] ?? [];
            // Replace positioners
            transformation.forEach(({ ports, positioner: type }) => {
                // Get PortSet from (inputs/outputs) of Component
                const set = contents[(data[ports] as Ref)["ref"]];
                const positionerRef = (set.data["positioner"] as Ref)["ref"]; // Get positioner ID from PortSet

                contents[positionerRef] = { "type": type, "data": {} };
            });
        });
    }

    // TODO: Migrate from nightly or non-nightly?
    // Migrate from old property system to new "props" property system
    //  https://github.com/OpenCircuits/OpenCircuits/pull/1087
    // if (v < 3.1) {
    //     // Represents the transformation of property keys by object type,
    //     //  `newKey` is assumed to be part of the object's `props` struct
    //     const transformations = {
    //         "Clock": [
    //             { prevKey: "frequency", newKey: "delay",  defaultVal: 0 },
    //             { prevKey: "paused",    newKey: "paused", defaultVal: 0 },
    //         ],
    //         "ConstantNumber": [
    //             { prevKey: "inputNum", newKey: "inputNum", defaultVal: 0 },
    //         ],
    //         "DigitalWire": [
    //             { prevKey: "color", newKey: "color", defaultVal: "#ffffff" },
    //         ],
    //         "Label": [
    //             { prevKey: "color",     newKey: "color",     defaultVal: "#ffffff"  },
    //             { prevKey: "textColor", newKey: "textColor", defaultVal: "#000000" },
    //         ],
    //         "LED": [
    //             { prevKey: "color", newKey: "color", defaultVal: "#ffffff" },
    //         ],
    //         "Oscilloscope": [
    //             { prevKey: "frequency",   newKey: "delay"      , defaultVal: 0     },
    //             { prevKey: "paused",      newKey: "paused"     , defaultVal: false },
    //             { prevKey: "numSamples",  newKey: "samples"    , defaultVal: 100   },
    //             { prevKey: "displaySize", newKey: "displaySize"                    },
    //         ],
    //     } as Record<string, Array<{ prevKey: string, newKey: string, defaultVal?: unknown }>>;

    //     Object.values(contents).forEach(({ type, data }) => {
    //         const transformation = transformations[type] ?? [];

    //         if (transformation.length === 0)
    //             return;

    //         // Add props with all the new properties
    //         data["props"] = {
    //             type: "",
    //             data: Object.fromEntries(
    //                 transformation.map(({ prevKey, newKey, defaultVal }) =>
    //                     [newKey, (data[prevKey] ?? defaultVal)]
    //                 )
    //             ),
    //         };

    //         // Remove old properties
    //         transformation.forEach(({ prevKey }) => (delete data[prevKey]));
    //     });
    // }

    // // Migrate transforms to Prop system and camera attributes to Props
    // if (v < 3.2) {
    //     Object.values(contents).forEach((entry) => {
    //         const t = getEntry(entry, "transform");
    //         if (!t)
    //             return;

    //         entry.data["props"] = {
    //             type: "",
    //             data: {
    //                 ...(entry.data["props"] as SerializationEntry ?? ({ data: {} }))["data"],
    //                 pos: getEntry(t, "pos")!,
    //                 size: getEntry(t, "size")!,
    //                 angle: t["data"]["angle"],
    //             },
    //         };
    //         delete entry.data["transform"];
    //     });

    //     // Get camera info
    //     const cam = getEntry(contents["0"], "camera")!;
    //     const pos = getEntry(cam, "pos");
    //     const zoom = cam["data"]["zoom"] as number;
    //     cam.data["props"] = {
    //         type: "",
    //         data: { pos, zoom },
    //     };
    // }

    // Migrate to model refactor api
    if (v < 4) {
        const designerRef = getEntry(contents["0"], "designer")!;
        const objectRefsEntry = getArrayEntry(designerRef, "objects")!;

        const objs = getArrayEntries(objectRefsEntry);
        const refToNewPort = new Map<string, DigitalPort>();
        const linkPorts = ({ ref, obj: port }: {ref?: string, obj: SerializationEntry}, newPort: DigitalPort) => {
            const portName = port["data"]["name"];
            if (typeof portName === "string") {
                newPort.name = portName;
            }
            if (ref) {
                refToNewPort.set(ref, newPort);
            }
        };
        objs.forEach(({ obj }) => {
            const transformRef = getEntry(obj, "transform")!;
            const posRef = getEntry(transformRef, "pos")!;
            const { x, y } = posRef.data as { x: number, y: number };
            // Scale x/y and flip y-axis
            const newObj = circuit.placeComponentAt(obj.type, V(x/50, y/-50));

            const inputs = getEntry(obj, "inputs")!;
            const outputs = getEntry(obj, "outputs")!;
            const selects = getEntry(obj, "selects");
            const inputCountRef = getEntry(inputs, "count")!;
            const inputCount = inputCountRef.data.value;
            const outputCountRef = getEntry(outputs, "count")!;
            const outputCount = outputCountRef.data.value;
            switch (obj.type) {
                case "Switch":
                    sim.setState(newObj.id, [obj.data.on ? Signal.On : Signal.Off]);
                    break;
                case "ConstantNumber":
                    newObj.setProp("inputNum", obj.data.inputNum as number);
                    break;
                case "Clock":
                    newObj.setProp("paused", !!obj.data.paused);
                    newObj.setProp("delay", obj.data.frequency as number);
                    sim.setState(newObj.id, [obj.data.isOn ? Signal.On : Signal.Off]);
                    break;
                case "LED":
                    newObj.setProp("color", obj.data.color as string);
                    break;
                case "SegmentDisplay":
                case "ORGate":
                case "ANDGate":
                case "XORGate":
                case "NORGate":
                case "NANDGate":
                case "XNORGate":
                    if (typeof inputCount === "number") {
                        newObj.setPortConfig({ "inputs": inputCount });
                    }
                    break;
                case "ASCIIDisplay":
                case "BCDDisplay":
                    newObj.setProp("segmentCount", obj.data.segmentCount as number);
                    break;
                case "Oscilloscope":
                    newObj.setProp("paused", !!obj.data.paused);
                    if (typeof inputCount === "number") {
                        newObj.setPortConfig({ "inputs": inputCount });
                    }
                    const displaySizeRef = getEntry(obj, "displaySize")!.data as { x: number, y: number };
                    newObj.setProp("w", displaySizeRef.x / 50);
                    newObj.setProp("h", displaySizeRef.y / 50);
                    newObj.setProp("delay", obj.data.frequency as number);
                    newObj.setProp("samples", obj.data.numSamples as number);
                    break;
                case "Multiplexer":
                case "Demultiplexer":
                    const selectCountRef = getEntry(selects!, "count")!;
                    const selectCount = selectCountRef.data.value;
                    if (typeof selectCount === "number") {
                        const otherPortGroup = obj.type === "Multiplexer" ? "inputs" : "outputs";
                        newObj.setPortConfig({ [otherPortGroup]: Math.pow(2, selectCount), "selects": selectCount });
                    }
                    break;
                case "Encoder":
                    if (typeof outputCount === "number") {
                        newObj.setPortConfig({ "inputs": Math.pow(2, outputCount), "outputs": outputCount });
                    }
                    break;
                case "Decoder":
                    if (typeof inputCount === "number") {
                        newObj.setPortConfig({ "inputs": inputCount, "outputs": Math.pow(2, inputCount) });
                    }
                    break;
                case "Comparator":
                    if (typeof inputCount === "number") {
                        newObj.setPortConfig({ "inputsA": inputCount / 2, "inputsB": inputCount / 2 });
                    }
                    break;
                case "Label":
                    newObj.setProp("bgColor", obj.data.color as string);
                    newObj.setProp("textColor", obj.data.textColor as string);
                    break;
            }

            const currentInputPorts = getArrayEntries(getArrayEntry(inputs, "currentPorts")!);
            const currentOutputPorts = getArrayEntries(getArrayEntry(outputs, "currentPorts")!);
            switch (obj.type) {
                case "SRFlipFlop":
                    linkPorts(currentInputPorts[0], newObj.ports["pre"][0]);
                    linkPorts(currentInputPorts[1], newObj.ports["clr"][0]);
                    linkPorts(currentInputPorts[2], newObj.ports["S"][0]);
                    linkPorts(currentInputPorts[3], newObj.ports["clk"][0]);
                    linkPorts(currentInputPorts[4], newObj.ports["R"][0]);
                    linkPorts(currentOutputPorts[0], newObj.ports["Q"][0]);
                    linkPorts(currentOutputPorts[1], newObj.ports["Qinv"][0]);
                    break;
                case "JKFlipFlop":
                    linkPorts(currentInputPorts[0], newObj.ports["pre"][0]);
                    linkPorts(currentInputPorts[1], newObj.ports["clr"][0]);
                    linkPorts(currentInputPorts[2], newObj.ports["J"][0]);
                    linkPorts(currentInputPorts[3], newObj.ports["clk"][0]);
                    linkPorts(currentInputPorts[4], newObj.ports["K"][0]);
                    linkPorts(currentOutputPorts[0], newObj.ports["Q"][0]);
                    linkPorts(currentOutputPorts[1], newObj.ports["Qinv"][0]);
                    break;
                case "DFlipFlop":
                    linkPorts(currentInputPorts[0], newObj.ports["pre"][0]);
                    linkPorts(currentInputPorts[1], newObj.ports["clr"][0]);
                    linkPorts(currentInputPorts[2], newObj.ports["D"][0]);
                    linkPorts(currentInputPorts[3], newObj.ports["clk"][0]);
                    linkPorts(currentOutputPorts[0], newObj.ports["Q"][0]);
                    linkPorts(currentOutputPorts[1], newObj.ports["Qinv"][0]);
                    break;
                case "TFlipFlop":
                    linkPorts(currentInputPorts[0], newObj.ports["pre"][0]);
                    linkPorts(currentInputPorts[1], newObj.ports["clr"][0]);
                    linkPorts(currentInputPorts[2], newObj.ports["T"][0]);
                    linkPorts(currentInputPorts[3], newObj.ports["clk"][0]);
                    linkPorts(currentOutputPorts[0], newObj.ports["Q"][0]);
                    linkPorts(currentOutputPorts[1], newObj.ports["Qinv"][0]);
                    break;
                case "DLatch":
                    linkPorts(currentInputPorts[0], newObj.ports["D"][0]);
                    linkPorts(currentInputPorts[1], newObj.ports["E"][0]);
                    linkPorts(currentOutputPorts[0], newObj.ports["Q"][0]);
                    linkPorts(currentOutputPorts[1], newObj.ports["Qinv"][0]);
                    break;
                case "SRLatch":
                    linkPorts(currentInputPorts[0], newObj.ports["S"][0]);
                    linkPorts(currentInputPorts[1], newObj.ports["E"][0]);
                    linkPorts(currentInputPorts[2], newObj.ports["R"][0]);
                    linkPorts(currentOutputPorts[0], newObj.ports["Q"][0]);
                    linkPorts(currentOutputPorts[1], newObj.ports["Qinv"][0]);
                    break;
                case "Multiplexer":
                case "Demultiplexer":
                    const currentSelectPorts = getArrayEntries(getArrayEntry(selects!, "currentPorts")!);
                    currentSelectPorts.forEach((info, index) => {
                        linkPorts(info, newObj.ports["selects"][index]);
                    });
                    currentInputPorts.forEach((info, index) => {
                        linkPorts(info, newObj.ports["inputs"][index]);
                    });
                    currentOutputPorts.forEach((info, index) => {
                        linkPorts(info, newObj.ports["outputs"][index]);
                    });
                    break;
                case "Comparator":
                    newObj.ports["inputsA"].forEach((newPort, index) => {
                        linkPorts(currentInputPorts[index], newPort);
                    });
                    newObj.ports["inputsB"].forEach((newPort, index) => {
                        linkPorts(currentInputPorts[index + newObj.ports["inputsA"].length], newPort);
                    });
                    linkPorts(currentOutputPorts[0], newObj.ports["lt"][0]);
                    linkPorts(currentOutputPorts[1], newObj.ports["eq"][0]);
                    linkPorts(currentOutputPorts[2], newObj.ports["gt"][0]);
                    break;
                default:
                    currentInputPorts.forEach((info, index) => {
                        linkPorts(info, newObj.inputs[index]);
                    });
                    currentOutputPorts.forEach((info, index) => {
                        linkPorts(info, newObj.outputs[index]);
                    });
                    break;
            }

            const angle = transformRef.data.angle as number;
            newObj.angle = angle;
            const nameRef = getEntry(obj, "name")!
            const nameData = nameRef.data as { name: string, set: boolean };
            newObj.name = nameData.name;
        });

        const wiresRefsEntry = getArrayEntry(designerRef, "wires")!;
        const wires = getArrayEntries(wiresRefsEntry);
        wires.forEach(({ obj }) => {
            const p1 = (obj.data.p1 as Ref).ref;
            const newPort1 = refToNewPort.get(p1)!;
            const p2 = (obj.data.p2 as Ref).ref;
            const newPort2 = refToNewPort.get(p2)!;
            const wire = newPort1.connectTo(newPort2)!;
            const nameRef = getEntry(obj, "name")!
            const nameData = nameRef.data as { name: string, set: boolean };
            if (nameData.set) {
                wire.name = nameData.name;
            }
            const { color } = obj.data;
            if (typeof color === "string") {
                wire.setProp("color", color);
            }
        });
    }

    return circuit.toSchema();
}

// export function VersionConflictPostResolver(version: string, data: ContentsData) {
//     const v = parseFloat(version);

//     const designer = data.designer as DigitalCircuitDesigner;

//     if (v < 3) {
//         // Fix issue where old ICs don't have the properly separated 'collections' so need to sort them out
//         designer.getObjects().filter((o) => o instanceof IC).forEach((ic: IC) => {
//             const INPUT_WHITELIST = [Switch, Button];

//             const c = ic["collection"];
//             const inputs = c["inputs"];
//             const others = c["others"];

//             const wrongInputs = inputs.filter((i) => !INPUT_WHITELIST.some((type) => i instanceof type));
//             wrongInputs.forEach((i) => {
//                 // Remove from `inputs` and push into `others`
//                 inputs.splice(inputs.indexOf(i), 1);
//                 others.push(i);
//             });
//         });
//     }
// }
