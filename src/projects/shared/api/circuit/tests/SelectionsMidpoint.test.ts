import {V}             from "Vector";
import {CreateCircuit} from "digital/api/circuit/public";

import "./Extensions";


describe("SelectionsMidpoint", () => {
    test("Single Selection", () => {
        // Create and place new component
        const [circuit, _] = CreateCircuit();
        const s1 = circuit.placeComponentAt("ANDGate", V(0, 0));

        // Select created component
        s1.isSelected = true;

        // Check component has been selected
        expect(s1.isSelected).toBe(true);

        // Calculate midpoint position using method
        const sm1 = circuit.selections.midpoint();

        // Check that method is returning correct midpoint position
        expect(sm1).toEqual(V(0,0));
    });
    test("Multiple Selections", () => {
        // Create and place new components
        const [circuit, _] = CreateCircuit();
        const s1 = circuit.placeComponentAt("Switch", V(-5, 5));
        const s2 = circuit.placeComponentAt("Switch", V(-5, -5));
        const c1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const l1 = circuit.placeComponentAt("LED", V(6, 0));

        // Select created components
        s1.isSelected = true;
        s2.isSelected = true;
        c1.isSelected = true;
        l1.isSelected = true;

        // Check component has been selected
        expect(s1.isSelected).toBe(true);
        expect(s2.isSelected).toBe(true);
        expect(c1.isSelected).toBe(true);
        expect(l1.isSelected).toBe(true);

        // Calculate midpoint position using method
        const methodMidpoint = circuit.selections.midpoint();

        // Check that method is returning correct midpoint position
        expect(methodMidpoint).toEqual(V(-1, 0));
    });
});
