import "shared/tests/helpers/Extensions";

import {V}    from "Vector";
import {Rect} from "math/Rect";

import {CreateTestCircuit} from "./helpers/CreateTestCircuit";


describe("SelectionsBounds", () => {
    test("Single Selection", () => {
        // Create and place new component
        const [circuit] = CreateTestCircuit();
        const s1 = circuit.placeComponentAt("ANDGate", V(0, 0));

        // Select created component
        s1.isSelected = true;

        // Check component has been selected
        expect(s1.isSelected).toBe(true);

        const bounds = circuit.selections.bounds;
        expect(bounds).toEqual(Rect.From({ cx: 0, cy: 0, width: 1, height: 1 }));
    });
    test("Multiple Selections", () => {
        // Create and place new components
        const [circuit] = CreateTestCircuit();
        const s1 = circuit.placeComponentAt("Switch", V(-5, 5));
        const s2 = circuit.placeComponentAt("Switch", V(-5, -5));
        const c1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const l1 = circuit.placeComponentAt("LED", V(5, 0));

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

        const bounds = circuit.selections.bounds;
        expect(bounds).toEqual(Rect.From({ left: -5.62, right: 5.5, bottom: -5.77, top: 5.77 }));
    });
});
