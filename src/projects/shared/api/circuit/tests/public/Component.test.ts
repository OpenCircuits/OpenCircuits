/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";
import {Rect} from "math/Rect";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Component", () => {
    describe("Bounds", () => {
        test("1x1 default", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.bounds).toEqual(Rect.From({ cx: 0, cy: 0, width: 1, height: 1 }));
        });

        test("1x1 with rotation", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.angle = Math.PI / 2;
            expect(c.bounds).toEqual(Rect.From({ cx: 0, cy: 0, width: 1, height: 1 }));
        });

        test("1x1 default offset start", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(-1, -1));
            expect(c.bounds).toEqual(Rect.From({ cx: -1, cy: -1, width: 1, height: 1 }));
        });
    });

    describe("Name", () => {
        test("set and undo/redo", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.name).toBeUndefined();
            c.name = "Test Component";
            expect(c.name).toBe("Test Component");
            circuit.undo();
            expect(c.name).toBeUndefined();
            circuit.redo();
            expect(c.name).toBe("Test Component");
        });
    });

    describe("isSelected", () => {
        test(".isSelected", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.isSelected).toBeFalsy();

            c.isSelected = true;
            expect(c.isSelected).toBeTruthy();
            circuit.undo();
            expect(c.isSelected).toBeFalsy();
            circuit.redo();
            expect(c.isSelected).toBeTruthy();

            c.isSelected = false;
            expect(c.isSelected).toBeFalsy();
            circuit.undo();
            expect(c.isSelected).toBeTruthy();
            circuit.redo();
            expect(c.isSelected).toBeFalsy();
        });

        test(".select/.deselect", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.isSelected).toBeFalsy();

            c.select();
            expect(c.isSelected).toBeTruthy();
            circuit.undo();
            expect(c.isSelected).toBeFalsy();
            circuit.redo();
            expect(c.isSelected).toBeTruthy();

            c.deselect();
            expect(c.isSelected).toBeFalsy();
            circuit.undo();
            expect(c.isSelected).toBeTruthy();
            circuit.redo();
            expect(c.isSelected).toBeFalsy();
        });
    });

    // TODO: Decide if we want to expose this.
    // describe("zIndex", () => {
    //     // Idk yet, not sure we even want to expose this
    // });

    describe("Exists", () => {
        test("add/delete and undo/redo", () => {
            const [circuit, _, {PlaceAt}] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.exists()).toBeTruthy();
            circuit.undo();
            expect(c.exists()).toBeFalsy();
            circuit.redo();
            expect(c.exists()).toBeTruthy();

            c.delete();
            expect(c.exists()).toBeFalsy();
            circuit.undo();
            expect(c.exists()).toBeTruthy();
            circuit.redo();
            expect(c.exists()).toBeFalsy();
        });
        test("circuit.deleteObjs", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));

            circuit.deleteObjs([c]);
            expect(c.exists()).toBeFalsy();
            circuit.undo();
            expect(c.exists()).toBeTruthy();
            circuit.redo();
            expect(c.exists()).toBeFalsy();
        });
    });

    describe("Props", () => {
        test("getProps", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.x = 1;
            c.y = 2;
            c.angle = 3;
            c.name = "Test Component";
            c.zIndex = 1;
            const props = c.getProps();
            expect("x" in props).toBeTruthy();
            expect("y" in props).toBeTruthy();
            expect("pos" in props).toBeFalsy();
            expect("angle" in props).toBeTruthy();
            expect("name" in props).toBeTruthy();
            expect("zIndex" in props).toBeTruthy();
        });

        test("setProp", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.setProp("name", "Test Component");
            expect(c.name).toBe("Test Component");
        });

        test("getProp", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.getProp("name")).toBeUndefined();
            c.name = "Test Component";
            expect(c.getProp("name")).toBe("Test Component");
        });

        test("getProp with invalid prop", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.getProp("fakeProp")).toBeUndefined();
        });

        test("Set invalid prop", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(() => {c.setProp("fakeProp", true)}).toThrow();
        });
    });

    describe("Transform", () => {
        test("Basic movement", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.x).toBe(0);
            expect(c.y).toBe(0);
            expect(c.pos).toEqual(V(0, 0));
            expect(c.angle).toBe(0);

            c.x = 3;
            expect(c.x).toBe(3);
            expect(c.y).toBe(0);
            expect(c.pos).toEqual(V(3, 0));
            expect(c.angle).toBe(0);
            c.y = 5;
            expect(c.x).toBe(3);
            expect(c.y).toBe(5);
            expect(c.pos).toEqual(V(3, 5));
            expect(c.angle).toBe(0);

            circuit.undo();
            expect(c.x).toBe(3);
            expect(c.y).toBe(0);
            expect(c.pos).toEqual(V(3, 0));
            expect(c.angle).toBe(0);
            circuit.redo();
            expect(c.x).toBe(3);
            expect(c.y).toBe(5);
            expect(c.pos).toEqual(V(3, 5));
            expect(c.angle).toBe(0);
        });

        test("Movement with .pos", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.x).toBe(0);
            expect(c.y).toBe(0);
            expect(c.pos).toEqual(V(0, 0));
            expect(c.angle).toBe(0);

            c.pos = V(9, -17);
            expect(c.x).toBe(9);
            expect(c.y).toBe(-17);
            expect(c.pos).toEqual(V(9, -17));
            expect(c.angle).toBe(0);

            // undo/redo
            circuit.undo();
            expect(c.x).toBe(0);
            expect(c.y).toBe(0);
            expect(c.pos).toEqual(V(0, 0));
            expect(c.angle).toBe(0);
            circuit.redo();
            expect(c.x).toBe(9);
            expect(c.y).toBe(-17);
            expect(c.pos).toEqual(V(9, -17));
            expect(c.angle).toBe(0);
        });

        test("Multiple moves in one transaction", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.x).toBe(0);
            expect(c.y).toBe(0);
            expect(c.pos).toEqual(V(0, 0));
            expect(c.angle).toBe(0);

            circuit.beginTransaction();
            c.pos = V(5, 0);
            expect(c.pos).toEqual(V(5, 0));
            c.pos = V(10, 0);
            circuit.commitTransaction();
            expect(c.pos).toEqual(V(10, 0));

            circuit.undo();
            expect(c.pos).toEqual(V(0, 0));
            circuit.redo();
            expect(c.pos).toEqual(V(10, 0));
        });
    });

    describe("isNode", () => {
        test("Test component is not a node", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.isNode()).toBeFalsy();
        });
    });

    describe("Ports", () => {
        test(".ports", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(Object.keys(c.ports)).toHaveLength(1);
            expect("" in c.ports).toBeTruthy();
            expect(c.ports[""]).toHaveLength(1);
            expect(() => c.setNumPorts("", 3)).toThrow();
            expect(c.ports[""]).toHaveLength(1);
        });

        test(".allPorts", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.allPorts).toHaveLength(1);
            expect(() => c.setNumPorts("", 6)).toThrow();
            expect(c.allPorts).toHaveLength(1);
        });

        test(".setNumPorts on invalid port group", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(() => c.setNumPorts("invalidGroup", 6)).toThrow();
        });

        test("firstAvailable", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit([{ "": 2 }]);
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            expect(c1.firstAvailable("")).toBeDefined();
            c1.setNumPorts("", 2);
            c1.firstAvailable("")!.connectTo(c2.firstAvailable("")!)
            expect(c1.firstAvailable("")).toBeDefined();
            expect(c2.firstAvailable("")).toBeDefined();
            expect(c1.ports[""][0].connections).toHaveLength(1);
            expect(c1.ports[""][1].connections).toHaveLength(0);
        });

        test("Use setNumPorts to remove connection", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit([{ "": 2 }]);
            const [c1, c2, c3] = PlaceAt(V(0, 0), V(1, 1), V(2, 2));
            expect(c1.firstAvailable("")).toBeDefined();
            c1.setNumPorts("", 2);
            c1.ports[""][0].connectTo(c2.ports[""][0])
            c1.ports[""][1].connectTo(c3.ports[""][0])
            c1.setNumPorts("", 1);
            expect(c1.ports[""]).toHaveLength(1);
            expect(c1.ports[""][0].connections).toHaveLength(1);
            expect(c2.ports[""]).toHaveLength(1);
            expect(c2.ports[""][0].connections).toHaveLength(1);
            expect(c3.ports[""]).toHaveLength(1);
            expect(c3.ports[""][0].connections).toHaveLength(0);
        });

    });

    // TODO: Do we even want this in the API?
    // describe("Connected Components", () => {
    // });
});