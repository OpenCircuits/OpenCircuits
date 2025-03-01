/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";
import {LineCurve} from "math/Line";


describe("SplitWireTool", () => {
    test("Click to Connect Comp -> Comp", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(0, 0), V(2, 0));

        input.click(GetPort(obj1).targetPos)
            .click(GetPort(obj2).targetPos);

        expect(obj1).toBeConnectedTo(obj2);
    });

    test("Connect Comp -> Comp then Split and then Undo/Redo", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(-1, 0), V(4, 2));

        // Connect Comp -> Comp
        input.drag(GetPort(obj1).targetPos,
                   GetPort(obj2).targetPos);

        // Split into Snap position
        const wire = GetPort(obj1).connections[0];
        input.press(wire.shape.getPos(0.5))
             .move(V(2, 0))
             .release();
        expect(obj1).not.toBeConnectedTo(obj2);
        input.pressKey("Control")
             .pressKey("z")
             .releaseKey("z")
             .releaseKey("Control");
        expect(obj1).toBeConnectedTo(obj2);
        input.pressKey("Control")
             .pressKey("y")
             .releaseKey("y")
             .releaseKey("Control");
        expect(obj1).not.toBeConnectedTo(obj2);
    });

    test("Connect Comp -> Comp then Split and Snap then Unsnap and move Down", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(0, 0), V(4, 0));

        // Connect Comp -> Comp
        input.drag(GetPort(obj1).targetPos,
                   GetPort(obj2).targetPos);

        // Split into Snap position
        const wire = GetPort(obj1).connections[0];
        input.press(wire.shape.getPos(0.5))
            .moveTo(V(2, 0));

        const node = GetPort(obj1).connectedPorts[0].parent;
        expect(node.isNode()).toBeTruthy();
        expect(GetPort(node).connections[0].shape).toBeInstanceOf(LineCurve);
        expect(GetPort(node).connections[1].shape).toBeInstanceOf(LineCurve);
        expect(node.pos).toApproximatelyEqual(V(2, 0));

        // Move down
        input.move(V(0, -1))
            .release();

        expect(GetPort(node).connections[0].shape).not.toBeInstanceOf(LineCurve);
        expect(GetPort(node).connections[1].shape).not.toBeInstanceOf(LineCurve);
        expect(node.pos).toApproximatelyEqual(V(2, -1));
    });

    test("Connect Comp -> Comp then Split Twice into Snapped Rectangle", () => {
        const [designer, input, _, { PlaceAt, GetPort }] = CreateTestCircuitDesigner();
        const [obj1, obj2] = PlaceAt(V(-1, 0), V(8, 2));

        // Connect Comp -> Comp
        input.drag(GetPort(obj1).targetPos,
                   GetPort(obj2).targetPos);

        // Split twice
        input.press(GetPort(obj1).connections[0].shape.getPos(0.5))
                .moveTo(V(0, -2))
                .release();
        input.press(GetPort(obj2).connections[0].shape.getPos(0.5))
                .moveTo(V(9, -2))
                .release();

        const node1 = GetPort(obj1).connectedPorts[0].parent;
        expect(node1.isNode()).toBeTruthy();
        expect(GetPort(node1).connections[0].shape).toBeInstanceOf(LineCurve);
        expect(GetPort(node1).connections[1].shape).toBeInstanceOf(LineCurve);
        expect(node1.pos).toApproximatelyEqual(V(0, -2));

        const node2 = GetPort(obj2).connectedPorts[0].parent;
        expect(node2.isNode()).toBeTruthy();
        expect(GetPort(node2).connections[0].shape).toBeInstanceOf(LineCurve);
        expect(GetPort(node2).connections[1].shape).toBeInstanceOf(LineCurve);
        expect(node2.pos).toApproximatelyEqual(V(9, -2));
    });
});
