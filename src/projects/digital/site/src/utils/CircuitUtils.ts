import {Circuit, ICPin, IntegratedCircuitDisplay} from "shared/api/circuit/public";
import {V} from "Vector";


export function CalculateICDisplay(circuit: Circuit): IntegratedCircuitDisplay {
    const validInputKinds = new Set(["Switch", "Button", "Clock"]);
    const validOutputKinds = new Set(["LED"]);

    const inputs = circuit.getComponents().filter((comp) => validInputKinds.has(comp.kind));
    const outputs = circuit.getComponents().filter((comp) => validOutputKinds.has(comp.kind));

    const longestName = Math.max(
        ...[...inputs, ...outputs].map((comp) => (comp.name?.length ?? 0)),
    ) + circuit.name.length;

    const w = 1 + 0.3*longestName;
    const h = inputs.length/2;

    return {
        size: V(w, h),
        pins: [
            ...inputs.map((input, index): ICPin => ({
                id:    input.allPorts[0].id,
                group: "inputs",
                pos:   V(-w / 2, -(index - (inputs.length)/2 + 0.5)/2),
            })),
            ...outputs.map((output, index): ICPin => ({
                id:    output.allPorts[0].id,
                group: "outputs",
                pos:   V(+w / 2, -(index - (inputs.length)/2 + 0.5)/2),
            })),
        ],
    };
}
