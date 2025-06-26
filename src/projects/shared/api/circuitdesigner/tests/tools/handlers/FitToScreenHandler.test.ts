import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("FitToScreenHandler", () => {
    test("Fit to Screen of a Single Object", () => {
        const [{ circuit, viewport }, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
        PlaceAt(V(1, 1));

        expect(circuit.getComponents()).toHaveLength(1);
        expect(circuit.selections.all).toHaveLength(0);

        input.pressKey("f")
            .releaseKey("f");
        // Unselected, fit to zoom includes the port's bounding box
        expect(viewport.camera.pos).toApproximatelyEqual(V(1.32, 1));

        input.click(V(1, 1));

        expect(circuit.selections.all).toHaveLength(1);

        input.pressKey("f")
            .releaseKey("f");

        expect(circuit.selections.all).toHaveLength(1);
        // Selected, fit to zoom only considers component's bounding box
        expect(viewport.camera.pos).toApproximatelyEqual(V(1, 1));

    });

    test("Fit to Screen with no objects", () => {
        const [{ circuit, viewport }, input, _, { }] = CreateTestCircuitDesigner();

        expect(circuit.getObjs()).toHaveLength(0);
        expect(circuit.selections.all).toHaveLength(0);

        input.pressKey("f")
            .releaseKey("f");

        expect(circuit.selections.all).toHaveLength(0);
        expect(viewport.camera.pos).toEqual(V(0, 0));
        expect(viewport.camera.zoom).toBe(0.02);

    });

    test("Fit to Screen of Two Connected Objects", () => {
        const [{ circuit, viewport }, input, _, { PlaceAt, Connect }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(0, 0), V(2, 2));
        Connect(obj1, obj2);

        expect(circuit.getComponents()).toHaveLength(2);
        expect(circuit.getWires()).toHaveLength(1);
        expect(circuit.selections.all).toHaveLength(0);

        input.pressKey("f")
            .releaseKey("f");

        expect(viewport.camera.pos).toApproximatelyEqual(V(1.386, 1));
    });
});
