/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("WiringTool", () => {
    test("Click to Connect Comp -> Comp", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(0, 0), V(2, 0));

        input.click(GetPort(obj1).targetPos)
            .click(GetPort(obj2).targetPos);

        expect(GetPort(obj1).connections).toHaveLength(1);
        expect(GetPort(obj2).connections).toHaveLength(1);
        expect(obj1).toBeConnectedTo(obj2);
    });

    test("Drag to Connect Comp -> Comp", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(0, 0), V(4, 0));

        input.drag(GetPort(obj1).targetPos,
                   GetPort(obj2).targetPos);

        expect(GetPort(obj1).connections).toHaveLength(1);
        expect(GetPort(obj2).connections).toHaveLength(1);
        expect(obj1).toBeConnectedTo(obj2);
    });

    test("Click to Connect Comp -> Comp (other direction)", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(0, 0), V(2, 0));

        input.click(GetPort(obj2).targetPos)
            .click(GetPort(obj1).targetPos);

        expect(GetPort(obj1).connections).toHaveLength(1);
        expect(GetPort(obj2).connections).toHaveLength(1);
        expect(obj1).toBeConnectedTo(obj2);
    });

    test("Drag to Connect Comp -> Comp (other direction)", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(0, 0), V(2, 0));

        input.drag(GetPort(obj2).targetPos,
                   GetPort(obj1).targetPos);

        expect(GetPort(obj1).connections).toHaveLength(1);
        expect(GetPort(obj2).connections).toHaveLength(1);
        expect(obj1).toBeConnectedTo(obj2);
    });

    test("Connect Comp to Multiple Comps", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2, obj3] = PlaceAt(V(0, 0), V(2, 4), V(2, -4));

        input.drag(GetPort(obj1).targetPos,
                   GetPort(obj2).targetPos);
        input.drag(GetPort(obj1).targetPos,
                    GetPort(obj3).targetPos);

        expect(GetPort(obj1).connections).toHaveLength(2);
        expect(GetPort(obj2).connections).toHaveLength(1);
        expect(GetPort(obj3).connections).toHaveLength(1);
        expect(obj1).toBeConnectedTo(obj2);
        expect(obj1).toBeConnectedTo(obj3);
    });
});
