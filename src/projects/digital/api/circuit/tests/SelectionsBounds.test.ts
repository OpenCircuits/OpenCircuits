import "shared/tests/helpers/Extensions";

import {V}             from "Vector";
import {CreateCircuit} from "digital/api/circuit/public";
import {Rect} from "math/Rect";


describe("SelectionsBounds", () => {
    test("Single Selection", () => {
        // Create and place new component
        const [circuit, _] = CreateCircuit();
        const s1 = circuit.placeComponentAt("ANDGate", V(0, 0));

        // Select created component
        s1.isSelected = true;

        // Check component has been selected
        expect(s1.isSelected).toBe(true);

        const bounds = circuit.selections.bounds;
        expect(bounds).toEqual(Rect.From({cx: 0, cy: 0, width: 1, height: 1}));
    });
    test("Multiple Selections", () => {
        // Create and place new components
        const [circuit, _] = CreateCircuit();
        const s1 = circuit.placeComponentAt("Switch", V(-5, 5));
        const s2 = circuit.placeComponentAt("Switch", V(-5, -5));
        const c1 = circuit.placeComponentAt("ANDGate", V(0, 0));
        const l1 = circuit.placeComponentAt("LED", V(2.12, 0));

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
        expect(bounds).toEqual(Rect.From({cx: -1, cy: 0, width: 2*4.62, height: 2*5.77}));
    });
});
