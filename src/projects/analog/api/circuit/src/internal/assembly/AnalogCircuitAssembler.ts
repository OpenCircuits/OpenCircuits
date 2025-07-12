import {V} from "Vector";

import {CircuitInternal} from "shared/api/circuit/internal";

import {CircuitAssembler}      from "shared/api/circuit/internal/assembly/CircuitAssembler";
import {WireAssembler}         from "shared/api/circuit/internal/assembly/WireAssembler";
import {RenderOptions}         from "shared/api/circuit/internal/assembly/RenderOptions";
import {NodeAssembler}         from "shared/api/circuit/internal/assembly/common/NodeAssembler";
import {ICComponentAssembler}  from "shared/api/circuit/internal/assembly/common/ICComponentAssembler";
import {LabelAssembler}        from "shared/api/circuit/internal/assembly/common/LabelAssembler";
import {SVGComponentAssembler} from "shared/api/circuit/internal/assembly/common/SVGComponentAssembler";


const TOP    = ({ origin: V(0,    0.5), dir: V(0,   1) });
const BOTTOM = ({ origin: V(0,   -0.5), dir: V(0,  -1) });
const LEFT   = ({ origin: V(-0.5,   0), dir: V(-1,  0) });
const RIGHT  = ({ origin: V(0.5,    0), dir: V(1,   0) });

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
        "VoltageSource": new SVGComponentAssembler(
            params,
            { "+": () => TOP, "-": () => BOTTOM },
            V(1, 1),
            "voltagesource.svg",
        ),
        "CurrentSource": new SVGComponentAssembler(
            params,
            { "+": () => TOP, "-": () => BOTTOM },
            V(1, 1),
            "currentsource.svg",
        ),

        // Essentials
        "Ground":    new SVGComponentAssembler(params, { "": () => TOP }, V(1.2, 0.6), "ground.svg"),
        "Resistor":  new SVGComponentAssembler(params, { "": (_, i) => [LEFT, RIGHT][i] }, V(1.2, 1), "resistor.svg"),
        "Capacitor": new SVGComponentAssembler(params, { "": (_, i) => [LEFT, RIGHT][i] }, V(0.4, 1.2), "capacitor.svg"),
        "Inductor":  new SVGComponentAssembler(params, { "": (_, i) => [TOP, BOTTOM][i] }, V(0.8, 240/104*0.8), "inductor.svg"),

        // Measurement

        // Other
        "Label": new LabelAssembler(params),
    }));
}
