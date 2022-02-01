import {Circuit, ContentsData} from "core/models/Circuit";
import {DigitalCircuitDesigner} from "digital/models";
import {Button, IC, Switch} from "digital/models/ioobjects";


type SerializationDataTypes = string | number | boolean | {ref: string}
interface SerializationEntry {
    type: string;
    data: Record<string, SerializationDataTypes>;
}

export function VersionConflictResolver(fileContents: string | Circuit): string {
    const circuit = (typeof(fileContents) == "string" ? JSON.parse(fileContents) as Circuit : fileContents);

    const v = parseFloat(circuit.metadata.version);

    const contents = circuit.contents;

    if (v < 2.1) {
        const c = JSON.parse(contents) as Record<string, SerializationEntry>;

        const replacePositioner = (val: SerializationEntry, ports: string, type: string): void => {
            const set = c[(val.data[ports] as {ref: string})["ref"]]; // Get PortSet from (inputs/outputs) of Component
            const positionerRef = (set.data["positioner"] as {ref: string})["ref"]; // Get positioner ID from PortSet

            c[positionerRef] = {"type": type, "data": {}};
        }

        const transformations: Record<string, Array<{ports: string, positioner: string}>> = {
            "Multiplexer":    [{ports: "inputs",  positioner: "ConstantSpacePositioner"},
                               {ports: "outputs", positioner: "Positioner"}],
            "Demultiplexer":  [{ports: "outputs", positioner: "ConstantSpacePositioner"},
                               {ports: "inputs",  positioner: "Positioner"}],
            "ANDGate":        [{ports: "inputs",  positioner: "Positioner"}],
            "NANDGate":       [{ports: "inputs",  positioner: "Positioner"}],
            "SegmentDisplay": [{ports: "inputs",  positioner: "ConstantSpacePositioner"}],
            "SRFlipFlop":     [{ports: "inputs",  positioner: "FlipFlopPositioner"}],
            "JKFlipFlop":     [{ports: "inputs",  positioner: "FlipFlopPositioner"}],
            "SRLatch":        [{ports: "inputs",  positioner: "Positioner"}]
        };

        Object.keys(c).forEach((key) => {
            const val = c[key];
            const transformation = transformations[val.type] || [];

            transformation.forEach((v) => {
                replacePositioner(val, v.ports, v.positioner);
            });
        });

        circuit.contents = JSON.stringify(c);
    }

    return JSON.stringify(circuit);
}

export function VersionConflictPostResolver(version: string, data: ContentsData) {
    const v = parseFloat(version);

    const designer = data.designer as DigitalCircuitDesigner;

    if (v < 3.0) {
        // Fix issue where old ICs don't have the properly separated 'collections' so need to sort them out
        designer.getObjects().filter(o => o instanceof IC).forEach((ic: IC) => {
            const INPUT_WHITELIST = [Switch, Button];

            const c = ic["collection"];
            const inputs = c["inputs"];
            const others = c["others"];

            const wrongInputs = inputs.filter(i => !INPUT_WHITELIST.some((type) => i instanceof type));
            wrongInputs.forEach(i => {
                // Remove from `inputs` and push into `others`
                inputs.splice(inputs.indexOf(i), 1);
                others.push(i);
            });
        });
    }
}
