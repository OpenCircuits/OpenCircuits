/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";
import {Rect} from "math/Rect";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Wire", () => {
    describe("Bounds", () => {
        test("Basic wire bounding box", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 0));

            const w1 = Connect(c1, c2);
            // TODO: Update height when we figure out the actual thickness of a wire
            expect(w1.bounds).toApproximatelyEqual(Rect.From({ left: 1, right: 2, bottom: 0, top: 0 }));
        });
    });

    describe("Name", () => {
        test("Set and undo/redo", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            const w1 = Connect(c1, c2);

            expect(w1.name).toBeUndefined();
            w1.name = "Test Wire";
            expect(w1.name).toBe("Test Wire");
            circuit.undo();
            expect(w1.name).toBeUndefined();
            circuit.redo();
            expect(w1.name).toBe("Test Wire");
        });
    });

    describe("isSelected", () => {
        test("isSelected", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            const w1 = Connect(c1, c2);
            expect(w1.isSelected).toBeFalsy();

            w1.isSelected = true;
            expect(w1.isSelected).toBeTruthy();
            circuit.undo();
            expect(w1.isSelected).toBeFalsy();
            circuit.redo();
            expect(w1.isSelected).toBeTruthy();

            w1.isSelected = false;
            expect(w1.isSelected).toBeFalsy();
            circuit.undo();
            expect(w1.isSelected).toBeTruthy();
            circuit.redo();
            expect(w1.isSelected).toBeFalsy();
        });

        test("Select/Deselect", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            const w1 = Connect(c1, c2);
            expect(w1.isSelected).toBeFalsy();

            w1.select();
            expect(w1.isSelected).toBeTruthy();
            circuit.undo();
            expect(w1.isSelected).toBeFalsy();
            circuit.redo();
            expect(w1.isSelected).toBeTruthy();

            w1.deselect();
            expect(w1.isSelected).toBeFalsy();
            circuit.undo();
            expect(w1.isSelected).toBeTruthy();
            circuit.redo();
            expect(w1.isSelected).toBeFalsy();
        });
    });

    // TODO: Decide if we want to expose this.
    // describe("zIndex", () => {
    //     // Idk yet, not sure we even want to expose this
    // });

    describe("Exists", () => {
        test("Add/delete and undo/redo", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            const w1 = Connect(c1, c2);
            expect(w1.exists()).toBeTruthy();
            circuit.undo();
            expect(w1.exists()).toBeFalsy();
            circuit.redo();
            expect(w1.exists()).toBeTruthy();
        });
        test("Circuit.deleteObjs", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            const w1 = Connect(c1, c2);

            circuit.deleteObjs([w1]);
            expect(w1.exists()).toBeFalsy();
            circuit.undo();
            expect(w1.exists()).toBeTruthy();
            circuit.redo();
            expect(w1.exists()).toBeFalsy();
        });
        test("Deleting connected component deletes wire", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            const w1 = Connect(c1, c2);

            circuit.deleteObjs([c1]);
            expect(w1.exists()).toBeFalsy();
            circuit.undo();
            expect(w1.exists()).toBeTruthy();
            circuit.redo();
            expect(w1.exists()).toBeFalsy();
        });
    });

    describe("Props", () => {
        test("getProps", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            w1.name = "Test Wire";
            w1.zIndex = 1;
            w1.setProp("color", "#ffffff");

            const props = w1.getProps();
            expect("name" in props).toBeTruthy();
            expect("color" in props).toBeTruthy();
            expect("zIndex" in props).toBeTruthy();
        });

        test("setProp", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            w1.setProp("name", "Test Wire");

            expect(w1.name).toBe("Test Wire");
        });

        test("getProp", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            expect(w1.getProp("name")).toBeUndefined();
            w1.name = "Test Wire";
            expect(w1.getProp("name")).toBe("Test Wire");
        });

        test("getProp with invalid prop", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            expect(w1.getProp("fakeProp")).toBeUndefined();
        });

        test("Set invalid prop", () => {
            const [circuit, { PlaceAt, Connect }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            expect(() => { w1.setProp("fakeProp", true) }).toThrow();
        });
    });

    describe("Ports", () => {
        test("Wire is connected to ports", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), p1 = GetPort(c1), p2 = GetPort(c2);

            const w1 = p1.connectTo(p2)!;
            expect(w1).toBeDefined();
            expect(w1.p1).toBeObj(p1);
            expect(w1.p2).toBeObj(p2);
        });
    });

    // TODO: Do we even want this in the API
    // describe("Path", () => {
    //     ///
    // });

    describe("Split", () => {
        test("split", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), p1 = GetPort(c1), p2 = GetPort(c2), w1 = Connect(c1, c2);

            const { node: n1, wire1: sw1, wire2: sw2 } = w1.split();

            expect(w1.exists()).toBeFalsy();
            expect(n1.exists()).toBeTruthy();
            expect(sw1.exists()).toBeTruthy();
            expect(sw2.exists()).toBeTruthy();
            expect(p1.connections[0]).toBeObj(sw1);
            expect(p2.connections[0]).toBeObj(sw2);
            expect(sw1.p1).toBeObj(p1);
            expect(sw2.p2).toBeObj(p2);
            expect(sw1.p2.parent).toBeObj(n1);
            expect(sw2.p1.parent).toBeObj(n1);

            circuit.undo();
            expect(w1.exists()).toBeTruthy();
            expect(n1.exists()).toBeFalsy();
            expect(sw1.exists()).toBeFalsy();
            expect(sw2.exists()).toBeFalsy();
            expect(p1.connections[0]).toBeObj(w1);
            expect(p2.connections[0]).toBeObj(w1);
            expect(w1.p1).toBeObj(p1);
            expect(w1.p2).toBeObj(p2);

            circuit.redo();
            expect(w1.exists()).toBeFalsy();
            expect(n1.exists()).toBeTruthy();
            expect(sw1.exists()).toBeTruthy();
            expect(sw2.exists()).toBeTruthy();
            expect(p1.connections[0]).toBeObj(sw1);
            expect(p2.connections[0]).toBeObj(sw2);
            expect(sw1.p1).toBeObj(p1);
            expect(sw2.p2).toBeObj(p2);
            expect(sw1.p2.parent).toBeObj(n1);
            expect(sw2.p1.parent).toBeObj(n1);

            expect(n1.isNode()).toBeTruthy();
        });
    });

    describe("Delete full path", () => {
        test("Delete full path with 1 node", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            const {node: n1, wire1: sw1, wire2: sw2 } = w1.split();
            sw1.delete();

            expect(sw1.exists()).toBeFalsy();
            expect(n1.exists()).toBeFalsy();
            expect(sw2.exists()).toBeFalsy();
            expect(circuit.getComponents()).toHaveLength(2);
            expect(circuit.getWires()).toHaveLength(0);

            circuit.undo();
            expect(sw1.exists()).toBeTruthy();
            expect(n1.exists()).toBeTruthy();
            expect(sw2.exists()).toBeTruthy();
            expect(circuit.getComponents()).toHaveLength(3);
            expect(circuit.getWires()).toHaveLength(2);

            circuit.redo();
            expect(sw1.exists()).toBeFalsy();
            expect(n1.exists()).toBeFalsy();
            expect(sw2.exists()).toBeFalsy();
            expect(circuit.getComponents()).toHaveLength(2);
            expect(circuit.getWires()).toHaveLength(0);
        });
        test("Delete full path with 2 nodes", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            const { node: n1, wire1: sw1, wire2: sw2 } = w1.split();
            const { node: n2, wire1: sw21, wire2: sw22 } = sw2.split();
            sw21.delete();

            expect(sw1.exists()).toBeFalsy();
            expect(n1.exists()).toBeFalsy();
            expect(n2.exists()).toBeFalsy();
            expect(sw21.exists()).toBeFalsy();
            expect(sw22.exists()).toBeFalsy();
            expect(circuit.getComponents()).toHaveLength(2);
            expect(circuit.getWires()).toHaveLength(0);

            circuit.undo();
            expect(sw1.exists()).toBeTruthy();
            expect(n1.exists()).toBeTruthy();
            expect(n2.exists()).toBeTruthy();
            expect(sw21.exists()).toBeTruthy();
            expect(sw22.exists()).toBeTruthy();
            expect(circuit.getComponents()).toHaveLength(4);
            expect(circuit.getWires()).toHaveLength(3);

            circuit.redo();
            expect(sw1.exists()).toBeFalsy();
            expect(n1.exists()).toBeFalsy();
            expect(n2.exists()).toBeFalsy();
            expect(sw21.exists()).toBeFalsy();
            expect(sw22.exists()).toBeFalsy();
            expect(circuit.getComponents()).toHaveLength(2);
            expect(circuit.getWires()).toHaveLength(0);
        });
    });
});
