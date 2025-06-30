/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("SelectHandler", () => {
    test("Simple click", () => {
        const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
        const selections = designer.circuit.selections;
        const [obj1] = PlaceAt(V(0, 0));

        input.moveTo(V(0, 0))
            .move(V(0, 0))
            .click();

        expect(selections.components).toHaveLength(1);
        expect(selections.components).toContainObjs([obj1]);
    });

    // TODO[#1369]
    // test("Move mouse without dragging", () => {
    //     const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
    //     const selections = designer.circuit.selections;
    //     const [obj1, obj2] = PlaceAt(V(0, 0), V(1, 0));

    //     input.moveTo(V(0, 0))
    //         .move(V(1, 0))
    //         .click();

    //     expect(designer.curTool).toBeUndefined(); // Wiring tool should be inactive
    //     expect(selections.components).toHaveLength(1);
    //     expect(selections.components).toContain(obj2);
    // });
});
