import {linspace} from "math/MathUtils";
import {Circuit, ReadonlyICPin, ReadonlyIntegratedCircuitDisplay} from "shared/api/circuit/public";
import {V} from "Vector";


export function CalculateICDisplay(circuit: Circuit): ReadonlyIntegratedCircuitDisplay {
    const inputs = circuit.getComponents().filter((comp) => (comp.kind === "InputPin"));
    const outputs = circuit.getComponents().filter((comp) => (comp.kind === "OutputPin"));

    const longestName = Math.max(
        ...[...inputs, ...outputs].map((comp) => (comp.name?.length ?? 0)),
    ) + circuit.name.length;

    const w = 1 + 0.3*longestName;
    const h = inputs.length/2;

    const inputYs  = linspace(1, -1, inputs.length,  { endpoint: false, centered: true });
    const outputYs = linspace(1, -1, outputs.length, { endpoint: false, centered: true });

    return {
        size: V(w, h),
        pins: [
            ...inputs.map((input, index): ReadonlyICPin => ({
                id:    input.allPorts[0].id,
                group: "inputs",
                name:  input.name ?? "",
                pos:   V(-1, inputYs[index]),
                dir:   V(-1, 0),
            })),
            ...outputs.map((output, index): ReadonlyICPin => ({
                id:    output.allPorts[0].id,
                group: "outputs",
                name:  output.name ?? "",
                pos:   V(+1, outputYs[index]),
                dir:   V(+1, 0),
            })),
        ],
    };
}
