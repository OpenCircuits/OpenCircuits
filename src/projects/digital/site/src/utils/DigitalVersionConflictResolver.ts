/* eslint-disable key-spacing */
import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {Schema as DigitalSchema} from "digital/api/circuit/schema";
import {Schema} from "shared/api/circuit/schema";
import {IsDefined} from "shared/api/circuit/utils/Reducers";


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
    // Sets are stored as arrays so they are functionally the same here
    type: "Array" | "Set";
    data: Array<Ref | SerializationEntry>;
}
function isSerializationArrayEntry(o: unknown): o is SerializationArrayEntry {
    if (!o || typeof o !== "object")
        return false;
    return ("type" in o && (o.type === "Array" || o.type === "Set") && "data" in o && Array.isArray(o.data));
}

function getSerializationGetters(contents: Record<string, SerializationEntry>) {
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
    return { getEntry, getArrayEntry, getArrayEntries };
}

function getICDataRef(ic: SerializationEntry) {
    if (ic.data.data && typeof ic.data.data === "object" && "ref" in ic.data.data) {
        return ic.data.data.ref as string;
    }
}

function migrateObjs(
    contents: Record<string, SerializationEntry>,
    componentsEntry: SerializationArrayEntry,
    wiresEntry: SerializationArrayEntry,
    icRefToGuid: Map<string, string>,
    isIc?: boolean
) {
    const { getEntry, getArrayEntry, getArrayEntries } = getSerializationGetters(contents);
    const objs = getArrayEntries(componentsEntry);
    const refToNewPort = new Map<string, string>();
    const pinRefToPortGuid = new Map<string, string>();
    // Helper function to generate connection between old ref string and new digital port, used to later connect wires
    const linkPorts = (
        { ref, obj: port }: {ref?: string, obj: SerializationEntry},
        portInfo: Omit<DigitalSchema.Core.Port, "baseKind" | "id" | "props" | "kind">,
    ): DigitalSchema.Core.Port => {
        const guid = Schema.uuid();
        if (ref) {
            refToNewPort.set(ref, guid);
        }
        const props: DigitalSchema.Core.Port["props"] = {};
        const portName = port["data"]["name"];
        if (typeof portName === "string") {
            props["name"] = portName;
        }
        const { group, index, parent } = portInfo;
        return {
            baseKind: "Port",
            group,
            index,
            parent,
            kind: "DigitalPort",
            props,
            id: guid,
        }
    };
    const simState: DigitalSchema.DigitalSimState = {
        signals: {},
        states: {},
        icStates: {},
    }
    const newPorts: DigitalSchema.Core.Port[] = [];
    const newComponents = objs.map(({ obj, ref }): DigitalSchema.Core.Component => {
        const transformRef = getEntry(obj, "transform")!;
        const posRef = getEntry(transformRef, "pos")!;
        const { x, y } = posRef.data as { x: unknown, y: unknown };
        const nameRef = getEntry(obj, "name")!
        const nameData = nameRef.data as { name: unknown, set: unknown };
        // Scale x/y and flip y-axis
        const props: DigitalSchema.Core.Component["props"] = {};
        if (typeof x === "number") {
            props["x"] = x / 50;
        }
        if (typeof y === "number") {
            props["y"] = y / -50;
        }
        if (typeof transformRef.data.angle === "number") {
            props["angle"] = transformRef.data.angle;
        }
        if (typeof nameData.name === "string") {
            props["name"] = nameData.name;
        }
        const guid = Schema.uuid();

        const inputs = getEntry(obj, "inputs")!;
        const outputs = getEntry(obj, "outputs")!;
        const selects = getEntry(obj, "selects");

        // Set component specific properties
        switch (obj.type) {
            case "Switch":
                simState.states[guid] = [obj.data.on ? Signal.On : Signal.Off];
                break;
            case "ConstantNumber":
                props["inputNum"] = obj.data.inputNum as number;
                break;
            case "Clock":
                props["paused"] = !!obj.data.paused;
                props["delay"] = obj.data.frequency as number;
                simState.states[guid] = [obj.data.isOn ? Signal.On : Signal.Off];
                break;
            case "LED":
                props["color"] = obj.data.color as string;
                break;
            case "ASCIIDisplay":
            case "BCDDisplay":
                props["segmentCount"] = obj.data.segmentCount as string;
                break;
            case "Oscilloscope":
                props["paused"] = !!obj.data.paused;
                const displaySizeData = getEntry(obj, "displaySize")!.data as { x: number, y: number };
                props["w"] = displaySizeData.x / 50;
                props["h"] = displaySizeData.y / 50;
                props["delay"] = obj.data.frequency as number;
                props["samples"] = obj.data.numSamples as number;
                break;
            case "Label":
                props["bgColor"] = obj.data.color as string;
                props["textColor"] = obj.data.textColor as string;
                break;
        }

        // Associate old port references with new ports
        const currentInputPorts = getArrayEntries(getArrayEntry(inputs, "currentPorts")!);
        const currentOutputPorts = getArrayEntries(getArrayEntry(outputs, "currentPorts")!);
        switch (obj.type) {
            // Flip flops, latches, muxes, and comparator don't have the same exact input/output ordering,
            //  so manually set them
            case "SRFlipFlop":
                newPorts.push(
                    linkPorts(currentInputPorts[0], { parent: guid, group: "pre", index: 0 }),
                    linkPorts(currentInputPorts[1], { parent: guid, group: "clr", index: 0 }),
                    linkPorts(currentInputPorts[2], { parent: guid, group: "S", index: 0 }),
                    linkPorts(currentInputPorts[3], { parent: guid, group: "clk", index: 0 }),
                    linkPorts(currentInputPorts[4], { parent: guid, group: "R", index: 0 }),
                    linkPorts(currentOutputPorts[0], { parent: guid, group: "Q", index: 0 }),
                    linkPorts(currentOutputPorts[1], { parent: guid, group: "Qinv", index: 0 }),
                );
                break;
            case "JKFlipFlop":
                newPorts.push(
                    linkPorts(currentInputPorts[0], { parent: guid, group: "pre", index: 0 }),
                    linkPorts(currentInputPorts[1], { parent: guid, group: "clr", index: 0 }),
                    linkPorts(currentInputPorts[2], { parent: guid, group: "J", index: 0 }),
                    linkPorts(currentInputPorts[3], { parent: guid, group: "clk", index: 0 }),
                    linkPorts(currentInputPorts[4], { parent: guid, group: "K", index: 0 }),
                    linkPorts(currentOutputPorts[0], { parent: guid, group: "Q", index: 0 }),
                    linkPorts(currentOutputPorts[1], { parent: guid, group: "Qinv", index: 0 }),
                );
                break;
            case "DFlipFlop":
                newPorts.push(
                    linkPorts(currentInputPorts[0], { parent: guid, group: "pre", index: 0 }),
                    linkPorts(currentInputPorts[1], { parent: guid, group: "clr", index: 0 }),
                    linkPorts(currentInputPorts[2], { parent: guid, group: "D", index: 0 }),
                    linkPorts(currentInputPorts[3], { parent: guid, group: "clk", index: 0 }),
                    linkPorts(currentOutputPorts[0], { parent: guid, group: "Q", index: 0 }),
                    linkPorts(currentOutputPorts[1], { parent: guid, group: "Qinv", index: 0 }),
                );
                break;
            case "TFlipFlop":
                newPorts.push(
                    linkPorts(currentInputPorts[0], { parent: guid, group: "pre", index: 0 }),
                    linkPorts(currentInputPorts[1], { parent: guid, group: "clr", index: 0 }),
                    linkPorts(currentInputPorts[2], { parent: guid, group: "T", index: 0 }),
                    linkPorts(currentInputPorts[3], { parent: guid, group: "clk", index: 0 }),
                    linkPorts(currentOutputPorts[0], { parent: guid, group: "Q", index: 0 }),
                    linkPorts(currentOutputPorts[1], { parent: guid, group: "Qinv", index: 0 }),
                );
                break;
            case "DLatch":
                newPorts.push(
                    linkPorts(currentInputPorts[0], { parent: guid, group: "D", index: 0 }),
                    linkPorts(currentInputPorts[1], { parent: guid, group: "E", index: 0 }),
                    linkPorts(currentOutputPorts[0], { parent: guid, group: "Q", index: 0 }),
                    linkPorts(currentOutputPorts[1], { parent: guid, group: "Qinv", index: 0 }),
                )
                break;
            case "SRLatch":
                newPorts.push(
                    linkPorts(currentInputPorts[0], { parent: guid, group: "S", index: 0 }),
                    linkPorts(currentInputPorts[1], { parent: guid, group: "E", index: 0 }),
                    linkPorts(currentInputPorts[2], { parent: guid, group: "R", index: 0 }),
                    linkPorts(currentOutputPorts[0], { parent: guid, group: "Q", index: 0 }),
                    linkPorts(currentOutputPorts[1], { parent: guid, group: "Qinv", index: 0 }),
                )
                break;
            case "Multiplexer":
            case "Demultiplexer":
                const currentSelectPorts = getArrayEntries(getArrayEntry(selects!, "currentPorts")!);
                newPorts.push(
                    ...currentSelectPorts.map((info, index) =>
                        linkPorts(info, { parent: guid, group: "selects", index: index })
                    ),
                    ...currentInputPorts.map((info, index) =>
                        linkPorts(info, { parent: guid, group: "inputs", index: index })
                    ),
                    ...currentOutputPorts.map((info, index) =>
                        linkPorts(info, { parent: guid, group: "outputs", index: index })
                    ),
                );
                break;
            case "Comparator":
                const inputCountRef = getEntry(inputs, "count")!;
                const inputCount = inputCountRef.data.value as number;
                const inputsPerGroup = inputCount / 2;
                newPorts.push(
                    ...currentInputPorts.map((info, index) => {
                        const [group, groupIndex] = index < inputsPerGroup ? ["inputsA", index] : ["inputsB", index - inputsPerGroup];
                        return linkPorts(info, { parent: guid, group, index: groupIndex })
                    }),
                    linkPorts(currentOutputPorts[0], { parent: guid, group: "lt", index: 0 }),
                    linkPorts(currentOutputPorts[1], { parent: guid, group: "eq", index: 0 }),
                    linkPorts(currentOutputPorts[2], { parent: guid, group: "gt", index: 0 }),
                );
                break;
            default:
                newPorts.push(
                    ...currentInputPorts.map((info, index) =>
                        linkPorts(info, { parent: guid, group: "inputs", index: index })
                    ),
                    ...currentOutputPorts.map((info, index) =>
                        linkPorts(info, { parent: guid, group: "outputs", index: index })
                    ),
                );
                break;
        }

        // Set inputs states
        if (obj.type === "Switch" || obj.type === "Clock") {
                simState.states[guid] = [obj.data.on ? Signal.On : Signal.Off];
                // Most recent port should be the output port
                simState.signals[newPorts.at(-1)!.id] = obj.data.on ? Signal.On : Signal.Off;
        }

        const comp = {
            baseKind: "Component",
            id: guid,
            props,
        } as const;

        if (obj.type === "IC") {
            return {
                kind: icRefToGuid.get(getICDataRef(obj)!)!,
                ...comp,
            }
        }
        if (isIc) {
            if (obj.type === "Switch" || obj.type === "Clock") {
                pinRefToPortGuid.set(ref!, newPorts.at(-1)!.id);
                return {
                    kind: "InputPin",
                    ...comp,
                }
            }
            if (obj.type === "LED") {
                pinRefToPortGuid.set(ref!, newPorts.at(-1)!.id);
                return {
                    kind: "OutputPin",
                    ...comp,
                }
            }
        }
        return {
            kind: obj.type,
            ...comp,
        };
    });

    const wires = getArrayEntries(wiresEntry);
    const newWires = wires.map(({ obj }): DigitalSchema.Core.Wire => {
        const p1 = (obj.data.p1 as Ref).ref;
        const newPort1 = refToNewPort.get(p1)!;
        const p2 = (obj.data.p2 as Ref).ref;
        const newPort2 = refToNewPort.get(p2)!;

        const props: DigitalSchema.Core.Wire["props"] = {};
        const nameRef = getEntry(obj, "name")!
        const nameData = nameRef.data as { name: string, set: boolean };
        if (nameData.set) {
            props["name"] = nameData.name;
        }
        const { color } = obj.data;
        if (typeof color === "string") {
            props["color"] = color;
        }
        return {
            baseKind: "Wire",
            kind: "DigitalWire",
            id: Schema.uuid(),
            p1: newPort1,
            p2: newPort2,
            props,
        };
    });

    return {
        objects: [...newComponents, ...newPorts, ...newWires],
        simState,
        pinRefToPortGuid,
    };
}

export function VersionConflictResolver(fileContents: string): DigitalSchema.DigitalCircuit {
    const oldCircuit = JSON.parse(fileContents);
    const version = oldCircuit.metadata.version;
    if (version === "digital/v0") {
        // TODO: Better validation
        return oldCircuit as DigitalSchema.DigitalCircuit;
    }
    const metadata: Schema.CircuitMetadata = {
        id: Schema.uuid(),
        name: oldCircuit?.metadata?.name ?? "",
        desc: oldCircuit?.metadata?.name ?? "",
        thumb: oldCircuit?.metadata?.thumb ?? oldCircuit?.metadata?.thumbnail ?? "",
        version: "digital/v0",
    };

    const contents = JSON.parse(oldCircuit.contents) as Record<string, SerializationEntry>;

    const { getEntry, getArrayEntry, getArrayEntries } = getSerializationGetters(contents);

    const cameraRef = getEntry(contents["0"], "camera")!;
    const cameraRefPos = getEntry(cameraRef, "pos")!;
    const camera: Schema.Camera = {
        x: (cameraRefPos.data.x as number) / 50,
        y: (cameraRefPos.data.y as number) / -50,
        zoom: (cameraRef.data.zoom as number),
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
    const designerRef = getEntry(contents["0"], "designer")!;
    const propagationTime = (designerRef.data.propagationTime as number | undefined) ?? 1;

    const icRefsEntry = getArrayEntry(designerRef, "ics")!;
    const icEntries = getArrayEntries(icRefsEntry);
    const icGuids = icEntries.map(() => Schema.uuid());
    const icRefToGuid = new Map<string, string>(
        icEntries.map(({ ref }, index): [string, string] | undefined => ref ? [ref, icGuids[index]] : undefined).filter(IsDefined)
    );
    const ics = icEntries.map(({ obj }, index): [string, DigitalSchema.DigitalIntegratedCircuit] => {
        const transformRef = getEntry(obj, "transform")!;
        const sizeRef = getEntry(transformRef, "size")!;
        const icContents = getEntry(obj, "collection")!;
        const { x, y } = sizeRef.data as {x: number, y: number};

        const objectRefsEntry = getArrayEntry(icContents, "components")!;
        const wiresRefsEntry = getArrayEntry(icContents, "wires")!;
        const { objects, simState: initialSimState, pinRefToPortGuid } = migrateObjs(contents, objectRefsEntry, wiresRefsEntry, icRefToGuid, true);


        const inputs = getArrayEntries(getArrayEntry(icContents, "inputs")!);
        const inputPorts = getArrayEntries(getArrayEntry(obj, "inputPorts")!);
        const inputPins = inputPorts.map(({ obj }, index): DigitalSchema.Core.IntegratedCircuitPin => {
            const origin = getEntry(obj, "origin")!;
            const { x, y } = origin.data as {x: number, y: number};
            const dir = getEntry(obj, "dir")!;
            const { x: dx, y: dy } = dir.data as {x: number, y: number};
            return {
                name: obj.data.name as string,
                id: pinRefToPortGuid.get(inputs[index].ref!)!,
                group: "inputs",
                x: x / 25,
                y: y / -25,
                dx: dx,
                dy: -dy,
            }
        });
        const outputs = getArrayEntries(getArrayEntry(icContents, "outputs")!);
        const outputPorts = getArrayEntries(getArrayEntry(obj, "outputPorts")!);
        const outputPins = outputPorts.map(({ obj }, index): DigitalSchema.Core.IntegratedCircuitPin => {
            const origin = getEntry(obj, "origin")!;
            const { x, y } = origin.data as {x: number, y: number};
            const dir = getEntry(obj, "dir")!;
            const { x: dx, y: dy } = dir.data as {x: number, y: number};
            return {
                name: obj.data.name as string,
                id: pinRefToPortGuid.get(outputs[index].ref!)!,
                group: "outputs",
                x: x / 25,
                y: y / -25,
                dx: dx,
                dy: -dy,
            }
        });

        const metadata: DigitalSchema.Core.IntegratedCircuitMetadata = {
            displayWidth: x / 50,
            displayHeight: y / 50,
            id: icGuids[index],
            name: obj.data.name as string,
            desc: "",
            thumb: "",
            version: "digital/v0",
            pins: [...inputPins, ...outputPins],
        };

        return [icGuids[index], {
            metadata,
            objects,
            initialSimState,
        }];
    });

    const objectRefsEntry = getArrayEntry(designerRef, "objects")!;
    const wiresRefsEntry = getArrayEntry(designerRef, "wires")!;
    const info = migrateObjs(contents, objectRefsEntry, wiresRefsEntry, icRefToGuid);

    // const simState = info.simState;
    const icGuidToSchema = new Map<string, DigitalSchema.DigitalIntegratedCircuit>(ics);
    const icInstances = info.objects.filter((obj): obj is DigitalSchema.Core.Component => obj.baseKind === "Component" && icGuidToSchema.has(obj.kind));
    const icStates = Object.fromEntries(icInstances.map((ic) => [ic.id, icGuidToSchema.get(ic.kind)!.initialSimState]));
    // simState.icStates = Object.fromEntries(ics.map((ic) => [ic.metadata.id, ic.initialSimState]));

    return {
        camera: camera,
        objects: info.objects,
        simState: {
            ...info.simState,
            icStates,
        },
        ics: ics.map(([, ic]) => ic),
        metadata,
        propagationTime,
    } satisfies DigitalSchema.DigitalCircuit;
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
