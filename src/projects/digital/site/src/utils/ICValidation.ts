import {Component} from "shared/api/circuit/public";


const timedComponents = new Set(["Oscilloscope", "Clock"]);
const segmentDisplays = new Set(["SegmentDisplay", "ASCIIDisplay", "BCDDisplay"]);
const requiredInputComponents = new Set(["Button", "Switch", "ConstantLow", "ConstantHigh", "ConstantNumber"]);

export const enum ICValidationStatus {
    Valid = 0,
    NoOutput,
    NoInput,
    Incomplete,
    ContainsTimedComponents,
    ContainsSegmentDisplays,
    Empty,
}
export const IsValidIC = (cs: Component[]): ICValidationStatus => {
    // Timed components and segment displays are not allowed
    if (cs.some((c) => timedComponents.has(c.kind)))
        return ICValidationStatus.ContainsTimedComponents;
    if (cs.some((c) => segmentDisplays.has(c.kind)))
        return ICValidationStatus.ContainsSegmentDisplays;

    // Split the provided components into which circuit group they are a part of,
    // then we will check that each one is valid
    const circuits: Component[][] = [];
    const visited = new Set<string>();
    for (const c of cs) {
        // Labels are allowed, have no connections, and an IC can't exclusively contain Labels, so skip
        if (c.kind === "Label")
            continue;
        if (visited.has(c.id))
            continue;
        visited.add(c.id);
        // TODO[]: Add something to the api to get all components connected.
        // bfs search connected components
        const circuit = [c];
        const queue = c.allPorts.flatMap((p1) => p1.connectedPorts.flatMap((p2) => p2.parent));
        while (queue.length > 0) {
            const curr = queue.pop()!;
            if (visited.has(curr.id))
                continue;
            visited.add(curr.id);
            circuit.push(curr);
            queue.push(...curr.allPorts.flatMap((p1) => p1.connectedPorts.flatMap((p2) => p2.parent)))
        }
        circuits.push(circuit);
    }

    // Should only happen with an empty selection or a selection of only Labels
    if (circuits.length === 0)
        return ICValidationStatus.Empty;

    const selectedComponents = new Set(cs.map(({ id }) => id));
    return circuits.map((circuit) => {
        // Must have an output, all non-LED outputs are banned
        if (!circuit.some((c) => c.kind === "LED"))
            return ICValidationStatus.NoOutput;

        // Must have a valid input
        if (!circuit.some((c) => requiredInputComponents.has(c.kind)))
            return ICValidationStatus.NoInput;

        // All the components that make up this circuit must be in the selection
        return circuit.every((c) => selectedComponents.has(c.id)) ? ICValidationStatus.Valid : ICValidationStatus.Incomplete;
    }).find((status) => status !== ICValidationStatus.Valid) ?? ICValidationStatus.Valid;
}
