import {V} from "Vector";

import {CircuitInternal} from "shared/api/circuit/internal";

import {CircuitAssembler}     from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {NodeAssembler}        from "shared/api/circuit/internal/assembly/NodeAssembler";
import {WireAssembler}        from "shared/api/circuit/internal/assembly/WireAssembler";
import {RenderOptions}        from "shared/api/circuit/internal/assembly/RenderOptions";
import {ICComponentAssembler} from "shared/api/circuit/internal/assembly/ICComponentAssembler";


export function MakeAnalogCircuitAssembler(
    circuit: CircuitInternal,
    options: RenderOptions,
): CircuitAssembler {
    return new CircuitAssembler(circuit, options, (params) => ({
        // Base types
        "AnalogWire": new WireAssembler(params),
        "AnalogNode": new NodeAssembler(params, { "": () => ({ origin: V(0, 0), target: V(0, 0) }) }),
        "IC":         new ICComponentAssembler(params),

        // Sources

        // Measurement

        // Essentials

        // Other

        // "Label": new LabelAssembler(params, sim),
    }));
}
