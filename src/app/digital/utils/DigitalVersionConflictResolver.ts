/* eslint-disable key-spacing */
import {Circuit, ContentsData} from "core/models/Circuit";

import {DigitalCircuitDesigner} from "digital/models";

import {Button, IC, Switch} from "digital/models/ioobjects";


interface SerializationEntry {
    type: string;
    data: Record<string, unknown>;
}

export function VersionConflictResolver(fileContents: string | Circuit): string {
    const circuit = (typeof(fileContents) === "string" ? JSON.parse(fileContents) as Circuit : fileContents);

    const v = parseFloat(circuit.metadata.version);

    const contents = JSON.parse(circuit.contents) as Record<string, SerializationEntry>;

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
                const set = contents[(data[ports] as {ref: string})["ref"]];
                const positionerRef = (set.data["positioner"] as {ref: string})["ref"]; // Get positioner ID from PortSet

                contents[positionerRef] = { "type": type, "data": {} };
            });
        });
    }

    // Migrate from old property system to new "props" property system
    //  https://github.com/OpenCircuits/OpenCircuits/pull/1087
    if (v < 3.1) {
        // Represents the transformation of property keys by object type,
        //  `newKey` is assumed to be part of the object's `props` struct
        const transformations = {
            "Clock": [
                { prevKey: "frequency", newKey: "delay",  defaultVal: 0 },
                { prevKey: "paused",    newKey: "paused", defaultVal: 0 },
            ],
            "ConstantNumber": [
                { prevKey: "inputNum", newKey: "inputNum", defaultVal: 0 },
            ],
            "DigitalWire": [
                { prevKey: "color", newKey: "color", defaultVal: "#ffffff" },
            ],
            "Label": [
                { prevKey: "color",     newKey: "color",     defaultVal: "#ffffff"  },
                { prevKey: "textColor", newKey: "textColor", defaultVal: "#000000" },
            ],
            "LED": [
                { prevKey: "color", newKey: "color", defaultVal: "#ffffff" },
            ],
            "Oscilloscope": [
                { prevKey: "frequency",   newKey: "delay"      , defaultVal: 0     },
                { prevKey: "paused",      newKey: "paused"     , defaultVal: false },
                { prevKey: "numSamples",  newKey: "samples"    , defaultVal: 100   },
                { prevKey: "displaySize", newKey: "displaySize"                    },
            ],
        } as Record<string, Array<{ prevKey: string, newKey: string, defaultVal?: unknown }>>;

        Object.values(contents).forEach(({ type, data }) => {
            const transformation = transformations[type] ?? [];

            if (transformation.length === 0)
                return;

            // Add props with all the new properties
            data["props"] = {
                type: "",
                data: Object.fromEntries(
                    transformation.map(({ prevKey, newKey, defaultVal }) =>
                        [newKey, (data[prevKey] ?? defaultVal)]
                    )
                ),
            };

            // Remove old properties
            transformation.forEach(({ prevKey }) => (delete data[prevKey]));
        })
    }


    circuit.contents = JSON.stringify(contents);
    return JSON.stringify(circuit);
}

export function VersionConflictPostResolver(version: string, data: ContentsData) {
    const v = parseFloat(version);

    const designer = data.designer as DigitalCircuitDesigner;

    if (v < 3) {
        // Fix issue where old ICs don't have the properly separated 'collections' so need to sort them out
        designer.getObjects().filter((o) => o instanceof IC).forEach((ic: IC) => {
            const INPUT_WHITELIST = [Switch, Button];

            const c = ic["collection"];
            const inputs = c["inputs"];
            const others = c["others"];

            const wrongInputs = inputs.filter((i) => !INPUT_WHITELIST.some((type) => i instanceof type));
            wrongInputs.forEach((i) => {
                // Remove from `inputs` and push into `others`
                inputs.splice(inputs.indexOf(i), 1);
                others.push(i);
            });
        });
    }
}
