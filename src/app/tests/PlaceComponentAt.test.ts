import {V} from "Vector";

import {CreateCircuit} from "digital/public";


// eslint-disable-next-line unicorn/prefer-module
Object.defineProperty(window, "crypto", { value: require("node:crypto") });

describe("PlaceComponentAt", () => {
    test("Basic Placement", () => {
        const circuit = CreateCircuit();

        const c = circuit.placeComponentAt(V(0, 0), "ANDGate");

        expect(circuit.getObj(c.id)!.id).toBe(c.id); // 2 inputs, 1 output, 1 component
        expect(circuit.getObjs()).toHaveLength(4);
    });
});
