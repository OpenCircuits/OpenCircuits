/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";
import {Rect} from "math/Rect";

import {V} from "Vector";
import {DefaultRenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestRootCircuit} from "tests/helpers/CreateTestCircuit";


describe("Port", () => {
    describe("Bounds", () => {
        const defaultPortLength = 1;
        const defaultPortRadius = 0.14;
        test("Default bounds", () => {
            const defaultPortHeight = 2 * defaultPortRadius;
            // defaultPortWidth assumes that defaultPortLength measures to the center of the Port's circle
            const defaultPortWidth = defaultPortLength + defaultPortRadius;
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(c.bounds).toEqual(Rect.From({cx: .5 * defaultPortWidth, cy: 0, width: defaultPortWidth, height: defaultPortHeight}));
        });
        test("rotation", () => {
            // defaultPortHeight assumes that defaultPortLength measures to the center of the Port's circle
            const defaultPortHeight = defaultPortLength + defaultPortRadius;
            const defaultPortWidth = 2 * defaultPortRadius;
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.angle = Math.PI / 2;
            expect(c.bounds).toEqual(Rect.From({cx: 0, cy: .5 * defaultPortWidth, width: defaultPortWidth, height: defaultPortHeight}));
        });
    });

    describe("Name", () => {
        test("set and undo/redo", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).name).toBeUndefined();
            GetPort(c).name = "Test Component";
            expect(GetPort(c).name).toBe("Test Component");
            circuit.undo();
            expect(GetPort(c).name).toBeUndefined();
            circuit.redo();
            expect(GetPort(c).name).toBe("Test Component");
        });
    });

    describe("isSelected", () => {
        test(".isSelected", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).isSelected).toBeFalsy();

            GetPort(c).isSelected = true;
            expect(GetPort(c).isSelected).toBeTruthy();
            circuit.undo();
            expect(GetPort(c).isSelected).toBeFalsy();
            circuit.redo();
            expect(GetPort(c).isSelected).toBeTruthy();

            GetPort(c).isSelected = false;
            expect(GetPort(c).isSelected).toBeFalsy();
            circuit.undo();
            expect(GetPort(c).isSelected).toBeTruthy();
            circuit.redo();
            expect(GetPort(c).isSelected).toBeFalsy();
        });

        test(".select/.deselect", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).isSelected).toBeFalsy();

            GetPort(c).select();
            expect(GetPort(c).isSelected).toBeTruthy();
            circuit.undo();
            expect(GetPort(c).isSelected).toBeFalsy();
            circuit.redo();
            expect(GetPort(c).isSelected).toBeTruthy();

            GetPort(c).deselect();
            expect(GetPort(c).isSelected).toBeFalsy();
            circuit.undo();
            expect(GetPort(c).isSelected).toBeTruthy();
            circuit.redo();
            expect(GetPort(c).isSelected).toBeFalsy();
        });
    });

    // TODO: Decide if we want to expose this.
    // describe("zIndex", () => {
    //     // Idk yet, not sure we even want to expose this
    // });

    describe("Exists", () => {
        test("add/delete and undo/redo", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).exists()).toBeTruthy();
            circuit.undo();
            expect(GetPort(c).exists()).toBeFalsy();
            circuit.redo();
            expect(GetPort(c).exists()).toBeTruthy();

            c.setNumPorts("", 2);
            const p2 = c.ports[""][1]
            expect(p2.exists()).toBeTruthy();
            circuit.undo();
            expect(p2.exists()).toBeFalsy();
            circuit.redo();
            expect(p2.exists()).toBeTruthy();

            c.setNumPorts("", 1);
            expect(GetPort(c).exists()).toBeTruthy();
            expect(p2.exists()).toBeFalsy();
            circuit.undo();
            expect(p2.exists()).toBeTruthy();
            circuit.redo();
            expect(p2.exists()).toBeFalsy();
        });
        test("circuit.deleteObjs", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));

            circuit.deleteObjs([c]);
            expect(GetPort(c).exists()).toBeFalsy();
            circuit.undo();
            expect(GetPort(c).exists()).toBeTruthy();
            circuit.redo();
            expect(GetPort(c).exists()).toBeFalsy();
        });
    });

    describe("Props", () => {
        test("getProps", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.x = 1;
            c.y = 2;
            c.name = "Test Component";
            const props = GetPort(c).getProps();
            expect("name" in props).toBeTruthy();
            expect("isSelected" in props).toBeTruthy();
            expect("exists" in props).toBeTruthy();
            expect("zIndex" in props).toBeTruthy();
        });

        test("setProp", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            GetPort(c).setProp("name", "Test Component");
            expect(GetPort(c).name).toBe("Test Component");
        });

        test("getProp", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).getProp("name")).toBeUndefined();
            GetPort(c).name = "Test Component";
            expect(GetPort(c).getProp("name")).toBe("Test Component");
        });

        test("getProp with invalid prop", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).getProp("fakeProp")).toBeUndefined();
        });

        test("Set invalid prop", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(() => {GetPort(c).setProp("fakeProp", true)}).toThrow();
        });
    });

    describe("Info", () => {
        test("parent", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).parent).toBe(c);
        });
        test("group", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.setNumPorts("", 2);
            expect(GetPort(c).group).toBe("");
            expect(c.ports[""][1].group).toBe("");
        });
        test("index", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.setNumPorts("", 2);
            expect(GetPort(c).index).toBe(0);
            expect(c.ports[""][1].index).toBe(1);
        });
    });

    describe("Position", () => {
        test("origin/target", () => {
            const [circuit, _, {PlaceAt, Connect, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            expect(GetPort(c).originPos.x).toBe(0);
            expect(GetPort(c).originPos.y).toBe(0);
            expect(GetPort(c).targetPos.x).toBe(1);
            expect(GetPort(c).targetPos.y).toBe(0);
            expect(GetPort(c).dir.x).toBe(1);
            expect(GetPort(c).dir.y).toBe(0);
        });
        test("rotation", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0));
            c.angle = Math.PI / 2;
            expect(GetPort(c).originPos.x).toBe(0);
            expect(GetPort(c).originPos.y).toBe(0);
            expect(GetPort(c).targetPos.x).toBe(0);
            expect(GetPort(c).targetPos.y).toBe(1);
            expect(GetPort(c).dir.x).toBe(0);
            expect(GetPort(c).dir.y).toBe(1);
        });
    });

    describe("Connections", () => {
        // Test ideas:
        // Connect some wires (using `connectTo`) and expect `connections` to return correctly
        // ^ Same thing with `connectedPorts` (feel free to steal from projects/digital/api/circuit/tests/Port.test.ts)
        test("connections", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            c2.setNumPorts("", 2);
            const p1 = c1.ports[""][0];
            const p2 = c2.ports[""][0];
            const p3 = c2.ports[""][1];
            p1.connectTo(p2);
            expect(p1.connections).toHaveLength(1);
            expect(p2.connections).toHaveLength(1);
            expect(p3.connections).toHaveLength(0);
        });
        test("connectedPorts", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            c2.setNumPorts("", 2);
            const p1 = c1.ports[""][0];
            const p2 = c2.ports[""][0];
            const p3 = c2.ports[""][1];
            p1.connectTo(p2);
            expect(p1.connectedPorts).toHaveLength(1);
            expect(p1.connectedPorts).toContain(p2);
            expect(p2.connectedPorts).toHaveLength(1);
            expect(p2.connectedPorts).toContain(p1);
            expect(p3.connectedPorts).toHaveLength(0);
        });
        test("use same port twice", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            c2.setNumPorts("", 2);
            const p1 = c1.ports[""][0];
            const p2 = c2.ports[""][0];
            const p3 = c2.ports[""][1];
            p1.connectTo(p2);
            p1.connectTo(p3);
            expect(p1.connectedPorts).toHaveLength(2);
            expect(p1.connectedPorts).toContainObjsExact([p2, p3]);
            expect(p2.connectedPorts).toHaveLength(1);
            expect(p2.connectedPorts).toContain(p1);
            expect(p3.connectedPorts).toHaveLength(1);
            expect(p3.connectedPorts).toContain(p1);
            expect(p1.connections).toHaveLength(2);
            expect(p2.connections).toHaveLength(1);
            expect(p3.connections).toHaveLength(1);
        });
        test("connected to self", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c1] = PlaceAt(V(0, 0));
            c1.setNumPorts("", 2);
            const p1 = c1.ports[""][0];
            const p2 = c1.ports[""][1];
            p1.connectTo(p1);
            // Decided 2025-2-28 that a port connecting to itself would only count one connection
            expect(p1.connections).toHaveLength(1);
            expect(p2.connections).toHaveLength(0);
            expect(p1.connectedPorts).toHaveLength(1);
            expect(p1.connectedPorts).toContain(p1);
            expect(p2.connectedPorts).toHaveLength(0);
        });
    });

    // TODO: Do we even want this in the API
    // describe("Path", () => {
    //     ///
    // });

    describe("Get Legal Wires", () => {
        test("can connect to self", () => {
            const [circuit, _, {PlaceAt, GetPort}] = CreateTestRootCircuit();
            const [c1] = PlaceAt(V(0, 0));
            const p1 = GetPort(c1);
            expect(p1.getLegalWires().contains(p1)).toBeTruthy();
            p1.connectTo(p1);
            expect(p1.getLegalWires().isWireable).toBeTruthy();
            expect(p1.getLegalWires().contains(p1)).toBeTruthy();
        });
    });
});
