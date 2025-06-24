import {Component} from "shared/api/circuit/public";


const bannedComponents = new Set(["Oscilloscope", "Clock", "SegmentDispaly", "ASCIIDisplay", "BCDDisplay"]);
const requiredInputComponents = new Set(["Button", "Switch", "ConstantLow", "ConstantHigh", "ConstantNumber"]);

export const IsValidIC = (cs: Component[]): boolean => {
    // Timed components and segment displays are not allowed
    if (cs.some((c) => bannedComponents.has(c.kind)))
        return false;

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
        return false;

    const selectedComponents = new Set(cs.map(({ id }) => id));
    return circuits.every((circuit) => {
        // Must have an output, all non-LED outputs are banned
        if (!circuit.some((c) => c.kind === "LED"))
            return false;

        // Must have a valid input
        if (!circuit.some((c) => requiredInputComponents.has(c.kind)))
            return false;

        // All the components that make up this circuit must be in the selection
        return circuit.every((c) => selectedComponents.has(c.id));
    });
}
