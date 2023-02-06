import {V} from "Vector";

import {CreateCircuit} from "digital/public";
import {SelectionsManager} from "core/internal/impl/SelectionsManager";

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
        // Calculate actual midpoint position
        const actualMidpoint = s1.pos;

        // Check that method is returning correct midpoint position
        expect(sm1).toEqual(actualMidpoint);

    });
    test("Multiple Selections", () => {

        // Create and place new components
        const circuit = CreateCircuit();
        const s1 = circuit.placeComponentAt(V(-5,  5), "Switch");
        const s2 = circuit.placeComponentAt(V(-5, -5), "Switch");
        const c1 = circuit.placeComponentAt(V(0,   0), "ANDGate");
        const l1 = circuit.placeComponentAt(V(5,   0), "LED");

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

        // Calculate actual midpoint position
        const xPosition = (s1.pos.x + s2.pos.x + c1.pos.x + l1.pos.x) / 4;
        const yPosition = (s1.pos.y + s2.pos.y + c1.pos.y + l1.pos.y) / 4;
        const actualMidpoint = V(xPosition, yPosition);

        // Check that method is returning correct midpoint position
        expect(methodMidpoint).toEqual(actualMidpoint);
    });
});
