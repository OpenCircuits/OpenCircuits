/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("SnipNodesHandler", () => {
    test("Simple snip", () => {
        const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
        const selections = designer.circuit.selections;
        const [obj1, obj2] = PlaceAt(V(0, 0), V(5, 0));

        input.moveTo(V(1, 0))
            .press()
            .moveTo(V(6, 0))
            .release();

        expect(obj1).toBeConnectedTo(obj2);

        input.moveTo(V(3, 0))
            .press()
            .move(V(0, 2))
            .release();

        expect(designer.circuit.getComponents()).toHaveLength(3);
        expect(designer.circuit.getWires()).toHaveLength(2);

        expect(selections.components).toHaveLength(1);

        const node = selections.components[0];
        expect(node.kind).toBe("TestNode");
        expect(node.pos).toApproximatelyEqual(V(3, 2));
    });

    test("Multiple snips", () => {
        const [designer, input, _, { PlaceAt }] = CreateTestCircuitDesigner();
        const selections = designer.circuit.selections;
        const [obj1, obj2] = PlaceAt(V(0, 0), V(10, 0));

        input.moveTo(V(1, 0))
            .press()
            .moveTo(V(11, 0))
            .release();

        expect(obj1).toBeConnectedTo(obj2);

        input.moveTo(V(2, 0))
            .press()
            .move(V(0, 1))
            .release();

        const node1 = selections.components[0];

        input.moveTo(V(9, 0.2))
            .press()
            .move(V(0, 1))
            .release();

        const node2 = selections.components[0];

        expect(node1).not.toBeObj(node2);

        input.moveTo(V(5, 1))
            .press()
            .move(V(0, 1))
            .release();

        const node3 = selections.components[0];

        expect(node3).not.toBeObj(node2);
        expect(designer.circuit.getComponents()).toHaveLength(5);
        expect(designer.circuit.getWires()).toHaveLength(4);

        selections.clear();

        // Delete nodes 1 and 2
        node1.select(); node2.select();
        input.pressKey("x").releaseKey("x");

        expect(designer.circuit.getComponents()).toHaveLength(3);
        expect(designer.circuit.getWires()).toHaveLength(2);
        expect(node1).not.toExist();
        expect(node2).not.toExist();
        expect(node3).toExist();
        expect(obj1).toBeConnectedTo(node3);
        expect(node3).toBeConnectedTo(obj2);

        // Undo and delete all 3
        designer.circuit.undo();
        node3.select();
        input.pressKey("x").releaseKey("x");

        expect(designer.circuit.getComponents()).toHaveLength(2);
        expect(designer.circuit.getWires()).toHaveLength(1);
        expect(node1).not.toExist();
        expect(node2).not.toExist();
        expect(node3).not.toExist();
        expect(obj1).toBeConnectedTo(obj2);
    });

    test("Snip Node with >2 connections", () => {
        const [designer, input, _, { PlaceAt, Connect }] = CreateTestCircuitDesigner();
        const selections = designer.circuit.selections;
        const [obj1, obj2, obj3] = PlaceAt(V(0, 0), V(5, 0), V(5, 5));

        Connect(obj1, obj2);

        input.moveTo(V(3, 0))
            .press()
            .move(V(0, 2))
            .release();

        const node = selections.components[0];

        Connect(node, obj3);

        expect(designer.circuit.getComponents()).toHaveLength(4);
        expect(designer.circuit.getWires()).toHaveLength(3);

        input.pressKey("x").releaseKey("x");

        expect(designer.circuit.getComponents()).toHaveLength(4);
        expect(designer.circuit.getWires()).toHaveLength(3);
    });
});
