import {V} from "Vector";
import {CreateCircuit} from "digital/public";

import "./Extensions";

describe("SelectionsMidpoint", () => {
    test("Single Selection", () => {
        // Create and place new component
        const circuit = CreateCircuit();
        const s1 = circuit.placeComponentAt(V(0, 0), "ANDGate");
   
        // Select created component
        s1.isSelected = true;

        // Check component has been selected
        expect(s1.isSelected).toEqual(true);

        // Calculate midpoint position using method
        const sm1 = circuit.selectionsMidpoint("screen");

        // Check that method is returning correct midpoint position
        expect(sm1).toEqual(V(0,0));
    });
    test("Multiple Selections", () => {
        // Create and place new components
        const circuit = CreateCircuit();
        const s1 = circuit.placeComponentAt(V(-5,  5), "Switch");
        const s2 = circuit.placeComponentAt(V(-5, -5), "Switch");
        const c1 = circuit.placeComponentAt(V(0,   0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(6,   0), "LED");

        // Select created components
        s1.isSelected = true;
        s2.isSelected = true;
        c1.isSelected = true;
        l1.isSelected = true;

        // Check component has been selected
        expect(s1.isSelected).toEqual(true);
        expect(s2.isSelected).toEqual(true);
        expect(c1.isSelected).toEqual(true);
        expect(l1.isSelected).toEqual(true);

        // Calculate midpoint position using method
        const methodMidpoint = circuit.selectionsMidpoint("screen");

        // Check that method is returning correct midpoint position
        expect(methodMidpoint).toEqual(V(-1, 0));
    });
});