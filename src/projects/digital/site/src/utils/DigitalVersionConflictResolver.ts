/* eslint-disable key-spacing */
import {Signal} from "digital/api/circuit/schema/Signal";
import {DigitalSchema} from "digital/api/circuit/schema";
import {Schema} from "shared/api/circuit/schema";
import {IMPORT_IC_CLOCK_MESSAGE} from "./Constants";


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
type RefAndObject = Partial<Ref> & {obj: SerializationEntry};

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


interface VersionConflictResolution {
    schema: DigitalSchema.DigitalCircuit;
    warnings?: string[];
}
export function VersionConflictResolver(fileContents: string): VersionConflictResolution {
    const oldCircuit = JSON.parse(fileContents);

    if (!("contents" in oldCircuit)) {
        // TODO: Better validation
        return {
            schema: oldCircuit as DigitalSchema.DigitalCircuit,
        };
    }

    const metadata: Schema.CircuitMetadata = {
        id: Schema.uuid(),
        name: oldCircuit?.metadata?.name ?? "",
        desc: oldCircuit?.metadata?.name ?? "",
        thumb: oldCircuit?.metadata?.thumb ?? oldCircuit?.metadata?.thumbnail ?? "",
        version: "digital/v0",
    };

    const contents = JSON.parse(oldCircuit.contents) as Record<string, SerializationEntry>;

    // Create guids for all refs from the start. This helps to link up initial states, particularly for ICs.
    // Inlined entries won't be in this Map which is fine because they aren't referenced by anything other than their parent.
    const refGuidPairs: Array<[string, string]> = Object.keys(contents).map((ref) => [ref, Schema.uuid()]);
    const refToGuid = new Map<string | undefined, string>(refGuidPairs);

    // This will keep track of if there has been a clock in an IC that got converted to a Switch
    let hasClockInIc = false;

    // Check if two objects recursively contain equivalent data, even in the references are not the same.
    // This is mainly used to map ICData to IC instances.
    const areEntriesEquivalent = (
        entry1?: SerializationEntry | SerializationArrayEntry,
        entry2?: SerializationEntry | SerializationArrayEntry,
        visited?: Set<string>,
    ): boolean => {
        // Use visited to avoid cyclical references with parent, connections, etc.
        visited ??= new Set();

        if (entry1 === undefined || entry2 === undefined)
            return entry1 === entry2;
        if (entry1.type !== entry2.type)
            return false;

        // Check array/set types
        if (isSerializationArrayEntry(entry1)) {
            if (!isSerializationArrayEntry(entry2))
                return false;
            const refsAndObjs1 = getArrayEntries(entry1);
            const refsAndObjs2 = getArrayEntries(entry2);
            // Check regardless of order
            return entry1.data.length === entry2.data.length &&
                refsAndObjs1.every(({ obj: obj1 }) =>
                    refsAndObjs2.some(({ obj: obj2 }) => areEntriesEquivalent(obj1, obj2, visited))
                );
        }
        if (isSerializationArrayEntry(entry2))
            return false;

        // Check all non-array entries
        const entry1Keys = Object.keys(entry1.data);
        const entry2Keys = Object.keys(entry2.data);
        if (entry1Keys.length !== entry2Keys.length)
            return false;
        return entry1Keys.every((key) => {
            if (!Object.prototype.hasOwnProperty.call(entry2.data, key))
                return false;
            const value1 = entry1.data[key];
            const value2 = entry2.data[key];
            // Shouldn't have functions but just in case, ignore them
            if (typeof value1 === "function" || typeof value2 === "function")
                return false;
            if (typeof value1 === "object" && typeof value2 === "object") {
                const er1 = getEntryAndRef(entry1, key)!;
                const er2 = getEntryAndRef(entry2, key)!;
                if (er1.ref && er2.ref) {
                    // If boths refs have already been checked, don't check again to avoid infinite recursion
                    if (visited.has(er1.ref) && visited.has(er2.ref))
                        return true;
                    visited.add(er1.ref);
                    visited.add(er2.ref);
                }
                return areEntriesEquivalent(getEntry(entry1, key), getEntry(entry2, key), visited);
            }
            // At this point value1 and value2 can only be primitives (or not equal)
            return value1 === value2;
        });
    }
    // Utility func to get data through a ref or directly
    const getEntry = (parent: SerializationEntry, key: string) => {
        const v = parent["data"][key];
        if (!v)
            return;
        if (isRef(v))
            return contents[v["ref"]];
        return v as SerializationEntry;
    }
    // Similar to getEntry but also get the ref if it exists
    const getEntryAndRef = (parent: SerializationEntry, key: string): RefAndObject | undefined => {
        const v = parent["data"][key];
        if (!v)
            return;
        if (isRef(v))
            return { ref: v.ref, obj: contents[v["ref"]] };
        return { obj: v as SerializationEntry };
    }
    // Get the array/set object that corresponds to the key
    const getArrayEntry = (parent: SerializationEntry, key: string) => {
        const v = parent["data"][key];
        if (!v)
            return;
        if (isSerializationArrayEntry(v))
            return v;
        if (isRef(v)) {
            const content = contents[v["ref"]];
            if (isSerializationArrayEntry(content)) {
                return content;
            }
        }
    }
    const getArrayEntries = (parent: SerializationArrayEntry) => parent.data.map((entry): RefAndObject => (isRef(entry))
        ? {
            ref: entry.ref,
            obj: contents[entry.ref],
        }
        : {
            obj: entry,
        }
    );
    // Used to find an IC data guid that corresponds to given IC instance uses
    const getICDataGuid = (
        icGuids: Array<[string, SerializationEntry]>,
        data: RefAndObject) => icGuids.find(([, entry]) => areEntriesEquivalent(entry, data.obj))![0];

    const migrateObjs = (
        objectsEntry: SerializationArrayEntry,
        wiresEntry: SerializationArrayEntry,
        icGuids: Array<[string, SerializationEntry]>,
        isIc?: boolean
    ) => {
        const objs = getArrayEntries(objectsEntry);
        const pinRefToPortGuid = new Map<string, string>();
        // Because SerializationEntrys can be inlined, we need to build guidsToObjs in here
        const guidsToObjs = new Map<string, SerializationEntry>();
        // Helper function to generate connection between old ref string and new digital port, used to later connect wires
        const linkPorts = (
            { ref, obj: port }: {ref?: string, obj: SerializationEntry},
            portInfo: Omit<Schema.Port, "baseKind" | "id" | "props" | "kind">,
        ): Schema.Port => {
            const guid = refToGuid.get(ref) ?? Schema.uuid();
            const props: Schema.Port["props"] = {};
            const portName = port["data"]["name"];
            if (typeof portName === "string") {
                props["name"] = portName;
            }
            guidsToObjs.set(guid, port);
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
        const newPorts: Schema.Port[] = [];
        // First map components (and get ports)
        const newComponents = objs.map(({ obj, ref }, index): Schema.Component => {
            // Copy common props
            const transformRef = getEntry(obj, "transform")!;
            const posRef = getEntry(transformRef, "pos")!;
            const { x, y } = posRef.data as { x: unknown, y: unknown };
            const nameRef = getEntry(obj, "name")!
            const nameData = nameRef.data as { name: unknown, set: unknown };
            // Scale x/y and flip y-axis
            const props: Schema.Component["props"] = {
                zIndex: index,
            };
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
            const guid = refToGuid.get(ref) ?? Schema.uuid();

            const inputs = getEntry(obj, "inputs")!;
            const outputs = getEntry(obj, "outputs")!;
            const selects = getEntry(obj, "selects");

            // Set component specific properties
            switch (obj.type) {
                case "ConstantNumber":
                    props["inputNum"] = obj.data.inputNum as number;
                    break;
                case "Clock":
                    // If this is in an IC, the clock will be replaced with a switch so don't need these props
                    if (!isIc) {
                        props["paused"] = !!obj.data.paused;
                        props["delay"] = obj.data.frequency as number;
                    }
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
                guidsToObjs.set(guid, obj);
            }

            const comp = {
                baseKind: "Component",
                id: guid,
                props,
            } as const;
            // Get the proper value for kind and return the constructed component
            if (obj.type === "IC") {
                guidsToObjs.set(guid, obj);
                const entryAndRef = getEntryAndRef(obj, "data")!;
                return {
                    kind: "IC",
                    icId: getICDataGuid(icGuids, entryAndRef),
                    ...comp,
                }
            }
            if (isIc) {
                if (obj.type === "Clock") {
                    hasClockInIc = true;
                    // Clocks in ICs no longer supported, switch to a Switch
                    return {
                        kind: "Switch",
                        ...comp,
                    }
                }
                if (obj.type === "Switch") {
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
        const newWires = wires.map(({ obj, ref }): Schema.Wire => {
            // Find connecting port guids
            const p1 = (obj.data.p1 as Ref).ref;
            const newPort1 = refToGuid.get(p1)!;
            const p2 = (obj.data.p2 as Ref).ref;
            const newPort2 = refToGuid.get(p2)!;

            // Handle common props
            const props: Schema.Wire["props"] = {};
            const nameRef = getEntry(obj, "name")!
            const nameData = nameRef.data as { name: string, set: boolean };
            if (nameData.set) {
                props["name"] = nameData.name;
            }
            const { color } = obj.data;
            if (typeof color === "string") {
                props["color"] = color;
            }

            // Return constructed wire
            return {
                baseKind: "Wire",
                kind: "DigitalWire",
                id: refToGuid.get(ref) ?? Schema.uuid(),
                p1: newPort1,
                p2: newPort2,
                props,
            };
        });

        return {
            objects: [...newComponents, ...newPorts, ...newWires],
            guidsToObjs,
            pinRefToPortGuid,
        };
    }

    const migrateSimState = (
        guidsToObjs: Map<string, SerializationEntry>,
        icGuidsToObjects: Map<string, SerializationEntry>,
    ) => {
        const icGuids = [...icGuidsToObjects.entries()];
        const guidsToObjsArray = [...guidsToObjs.entries()];

        // Find the ports, inputs, and ic instances we will need for the signals, states, and icStates respectively
        const guidsToPorts = guidsToObjsArray.filter(([, { type }]) => type === "DigitalInputPort" || type === "DigitalOutputPort");
        const guidsToInputs = guidsToObjsArray.filter(([, { type }]) => type === "Switch" || type === "Clock");
        const guidsToICInstances = guidsToObjsArray.filter(([, { type }]) => type === "IC");

        // Recursively get initial IC states
        const guidsToICInstancesEntries = guidsToICInstances.map(([guid, obj]) => {
            const entryAndRef = getEntryAndRef(obj, "data")!;
            // IC instances can inline a copy of ICData, we need to map it back to find the original guid
            const icDataGuid = getICDataGuid(icGuids, entryAndRef);
            const icDataEntry = icGuidsToObjects.get(icDataGuid)!;
            const icDataCollection = getEntry(icDataEntry, "collection")!;
            const icDataComponents = getArrayEntries(getArrayEntry(icDataCollection, "components")!);
            const newGuidsToObjs: Array<[string, SerializationEntry]> = icDataComponents.map(({ ref, obj }) => [refToGuid.get(ref)!, obj]);
            return [guid, migrateSimState(new Map<string, SerializationEntry>(newGuidsToObjs), icGuidsToObjects)];
        });

        const simState: DigitalSchema.DigitalSimState = {
            signals: Object.fromEntries(guidsToPorts.filter(([, { data }]) => data.isOn).map(([guid]) => [guid, Signal.On])),
            states: Object.fromEntries(guidsToInputs.map(([guid, { data }]) => [guid, [data.isOn ? Signal.On : Signal.Off]])),
            icStates: Object.fromEntries(guidsToICInstancesEntries),
        }
        return simState;
    }

    // Copy camera info (and scale/flip)
    const cameraRef = getEntry(contents["0"], "camera")!;
    const cameraRefPos = getEntry(cameraRef, "pos")!;
    const camera: Schema.Camera = {
        x: (cameraRefPos.data.x as number) / 50,
        y: (cameraRefPos.data.y as number) / -50,
        zoom: (cameraRef.data.zoom as number) / 50,
    }

    // Migrate to model refactor api
    const designerRef = getEntry(contents["0"], "designer")!;
    const propagationTime = (designerRef.data.propagationTime as number | undefined) ?? 1;

    // Migrate IC data
    const icRefsEntry = getArrayEntry(designerRef, "ics")!;
    const icEntries = getArrayEntries(icRefsEntry);
    const icGuids: Array<[string, SerializationEntry]> = icEntries.map(({ ref, obj }) => [refToGuid.get(ref) ?? Schema.uuid(), obj]);
    const icGuidsToObjects = new Map<string, SerializationEntry>(icGuids);
    const icsAndSimStates = icEntries.map(({ obj }, index) => {
        const transformRef = getEntry(obj, "transform")!;
        const sizeRef = getEntry(transformRef, "size")!;
        const icContents = getEntry(obj, "collection")!;
        const { x: w, y: h } = sizeRef.data as {x: number, y: number};

        const objectRefsEntry = getArrayEntry(icContents, "components")!;
        const wiresRefsEntry = getArrayEntry(icContents, "wires")!;

        const { guidsToObjs, objects, pinRefToPortGuid } = migrateObjs(objectRefsEntry, wiresRefsEntry, icGuids, true);
        const initialSimState = migrateSimState(guidsToObjs, icGuidsToObjects);

        const inputs = getArrayEntries(getArrayEntry(icContents, "inputs")!);
        const inputPorts = getArrayEntries(getArrayEntry(obj, "inputPorts")!);
        // inputs and their ports are (presumably) linked on index, so when sorting they need to be zipped together
        const inputsAndPorts = inputs.zip(inputPorts);
        const inputPins = inputsAndPorts.map(([{ ref }, { obj }]): Schema.IntegratedCircuitPin => {
            const origin = getEntry(obj, "origin")!;
            const { x, y } = origin.data as {x: number, y: number};
            const dir = getEntry(obj, "dir")!;
            const { x: dx, y: dy } = dir.data as {x: number, y: number};
            return {
                name: obj.data.name as string,
                id: pinRefToPortGuid.get(ref!)!,
                group: "inputs",
                x: x / (w / 2),
                y: -y / (h / 2),
                dx: dx,
                dy: -dy,
            }
        });
        const outputs = getArrayEntries(getArrayEntry(icContents, "outputs")!);
        const outputPorts = getArrayEntries(getArrayEntry(obj, "outputPorts")!);
        const outputsAndPorts = outputs.zip(outputPorts);
        const outputPins = outputsAndPorts.map(([{ ref }, { obj }]): Schema.IntegratedCircuitPin => {
            const origin = getEntry(obj, "origin")!;
            const { x, y } = origin.data as {x: number, y: number};
            const dir = getEntry(obj, "dir")!;
            const { x: dx, y: dy } = dir.data as {x: number, y: number};
            return {
                name: obj.data.name as string,
                id: pinRefToPortGuid.get(ref!)!,
                group: "outputs",
                x: x / (w / 2),
                y: -y / (h / 2),
                dx: dx,
                dy: -dy,
            }
        });

        const metadata: Schema.IntegratedCircuitMetadata = {
            displayWidth: w / 50,
            displayHeight: h / 50,
            id: icGuids[index][0],
            name: obj.data.name as string,
            desc: "",
            thumb: "",
            version: "digital/v0",
            pins: [...inputPins, ...outputPins],
        };

        return [{
            metadata,
            objects,
        }, initialSimState] as const;
    });

    // Migrate all the main circuit data
    const objectRefsEntry = getArrayEntry(designerRef, "objects")!;
    const wiresRefsEntry = getArrayEntry(designerRef, "wires")!;
    const info = migrateObjs(objectRefsEntry, wiresRefsEntry, icGuids);

    const simState = migrateSimState(info.guidsToObjs, icGuidsToObjects);

    return {
        schema: {
            metadata,
            camera: camera,
            ics:     icsAndSimStates.map(([ic, _]) => ic),
            objects: info.objects,
            initialICSimStates: icsAndSimStates.map(([_, sim]) => sim),
            simState,
            propagationTime,
        },
        warnings: hasClockInIc ? [IMPORT_IC_CLOCK_MESSAGE] : undefined,
    };
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
