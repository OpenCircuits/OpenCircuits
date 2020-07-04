import {serializable, addCustomBehavior} from "serialeazy";

import {DEFAULT_SIZE} from "core/utils/Constants";

import {Circuit} from "core/models/Circuit";
import {Positioner} from "core/models/ports/positioners/Positioner";
import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {Multiplexer, Demultiplexer, ANDGate} from "digital/models/ioobjects";
import {OutputPort} from "digital/models/ports/OutputPort";
import {InputPort} from "digital/models/ports/InputPort";

class Blank {}

export function VersionConflictResolver(contents: string): void {
    const circuit = JSON.parse(contents) as Circuit;

    const v = parseFloat(circuit.metadata.version);

    if (v < 2.1) {
        // This is when mux positioners were removed
        addCustomBehavior<Multiplexer>("Multiplexer", {
            customDeserialization: (s, obj, data, refs, root) => {
                s.defaultDeserialize(obj, data, refs, root);
                obj["inputs"] ["positioner"] = new ConstantSpacePositioner<InputPort>("left", DEFAULT_SIZE);
                obj["outputs"]["positioner"] = new Positioner<OutputPort>("right");
                obj["inputs"].updatePortPositions();
                obj["outputs"].updatePortPositions();
            }
        });
        addCustomBehavior<Demultiplexer>("Demultiplexer", {
            customDeserialization: (s, obj, data, refs, root) => {
                s.defaultDeserialize(obj, data, refs, root);
                obj["inputs"] ["positioner"] = new Positioner<InputPort>("left");
                obj["outputs"]["positioner"] = new ConstantSpacePositioner<OutputPort>("right", DEFAULT_SIZE);
                obj["inputs"].updatePortPositions();
                obj["outputs"].updatePortPositions();
            }
        });
        addCustomBehavior<ANDGate>("ANDGate", {
            customDeserialization: (s, obj, data, refs, root) => {
                s.defaultDeserialize(obj, data, refs, root);
                obj["inputs"]["positioner"] = new Positioner<InputPort>("left");
                obj["inputs"].updatePortPositions();
            }
        });
        serializable("MuxPositioner", {customDeserialization: () => {}})(Blank);
        serializable("MuxSinglePortPositioner", {customDeserialization: () => {}})(Blank);
        serializable("ANDGatePositioner", {customDeserialization: () => {}})(Blank);
    }
}