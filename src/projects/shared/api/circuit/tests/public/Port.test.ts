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
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.bounds).toApproximatelyEqual(Rect.From({
                bottom: -defaultPortRadius,
                top:    defaultPortRadius,
                left:   0,
                right:  defaultPortLength + defaultPortRadius,
            }));
        });
        test("Rotation", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            c.angle = Math.PI / 2;
            expect(port.bounds).toApproximatelyEqual(Rect.From({
                left:   -defaultPortRadius,
                right:  defaultPortRadius,
                bottom: 0,
                top:    defaultPortLength + defaultPortRadius,
            }));
        });
    });

    describe("Name", () => {
        test("set and undo/redo", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.name).toBeUndefined();
            GetPort(c).name = "Test Component";
            expect(port.name).toBe("Test Component");
            circuit.undo();
            expect(port.name).toBeUndefined();
            circuit.redo();
            expect(port.name).toBe("Test Component");
        });
    });

    describe("isSelected", () => {
        test("Set/Get isSelected", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.isSelected).toBeFalsy();

            port.isSelected = true;
            expect(port.isSelected).toBeTruthy();
            circuit.undo();
            expect(port.isSelected).toBeFalsy();
            circuit.redo();
            expect(port.isSelected).toBeTruthy();

            port.isSelected = false;
            expect(port.isSelected).toBeFalsy();
            circuit.undo();
            expect(port.isSelected).toBeTruthy();
            circuit.redo();
            expect(port.isSelected).toBeFalsy();
        });

        test("Select/Deselect", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.isSelected).toBeFalsy();

            port.select();
            expect(port.isSelected).toBeTruthy();
            circuit.undo();
            expect(port.isSelected).toBeFalsy();
            circuit.redo();
            expect(port.isSelected).toBeTruthy();

            port.deselect();
            expect(port.isSelected).toBeFalsy();
            circuit.undo();
            expect(port.isSelected).toBeTruthy();
            circuit.redo();
            expect(port.isSelected).toBeFalsy();
        });
    });

    // TODO: Decide if we want to expose this.
    // describe("zIndex", () => {
    //     // Idk yet, not sure we even want to expose this
    // });

    describe("Exists", () => {
        test("Add/delete and undo/redo", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit([{ "": 2 }]);
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.exists()).toBeTruthy();
            circuit.undo();
            expect(port.exists()).toBeFalsy();
            circuit.redo();
            expect(port.exists()).toBeTruthy();

            expect(c.setNumPorts("", 2)).toBeTruthy();
            const p2 = c.ports[""][1];

            expect(p2.exists()).toBeTruthy();
            circuit.undo();
            expect(p2.exists()).toBeFalsy();
            circuit.redo();
            expect(p2.exists()).toBeTruthy();

            expect(c.setNumPorts("", 1)).toBeTruthy();
            expect(port.exists()).toBeTruthy();

            expect(p2.exists()).toBeFalsy();
            circuit.undo();
            expect(p2.exists()).toBeTruthy();
            circuit.redo();
            expect(p2.exists()).toBeFalsy();
        });
        test("circuit.deleteObjs", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            circuit.deleteObjs([c]);
            expect(port.exists()).toBeFalsy();
            circuit.undo();
            expect(port.exists()).toBeTruthy();
            circuit.redo();
            expect(port.exists()).toBeFalsy();
        });
    });

    describe("Props", () => {
        test("getProps", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            port.name = "Test Port";
            port.zIndex = 1;
            port.select();

            const props = port.getProps();

            expect("name" in props).toBeTruthy();
            expect("isSelected" in props).toBeTruthy();
            expect("exists" in props).toBeFalsy();
            expect("zIndex" in props).toBeTruthy();
        });

        test("setProp", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            port.setProp("name", "Test Component");
            expect(port.name).toBe("Test Component");
        });

        test("getProp", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.getProp("name")).toBeUndefined();
            port.name = "Test Component";
            expect(port.getProp("name")).toBe("Test Component");
        });

        test("getProp with invalid prop", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.getProp("fakeProp")).toBeUndefined();
        });

        test("Set invalid prop", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(() => { port.setProp("fakeProp", true) }).toThrow();
        });
    });

    describe("Info", () => {
        test("parent", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.parent).toBeObj(c);
        });
        test("group", () => {
            const [circuit, _, { PlaceAt }] = CreateTestRootCircuit([{ "": 2 }]);
            const [c] = PlaceAt(V(0, 0));

            expect(c.setNumPorts("", 2)).toBeTruthy();
            expect(c.ports[""][0].group).toBe("");
            expect(c.ports[""][1].group).toBe("");
        });
        test("index", () => {
            const [circuit, _, { PlaceAt }] = CreateTestRootCircuit([{ "": 2 }]);
            const [c] = PlaceAt(V(0, 0));

            expect(c.setNumPorts("", 2)).toBeTruthy();
            expect(c.ports[""][0].index).toBe(0);
            expect(c.ports[""][1].index).toBe(1);
        });
    });

    describe("Position", () => {
        test("Origin/Target", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            expect(port.originPos.x).toApproximatelyEqual(0);
            expect(port.originPos.y).toApproximatelyEqual(0);
            expect(port.targetPos.x).toApproximatelyEqual(1);
            expect(port.targetPos.y).toApproximatelyEqual(0);
            expect(port.dir.x).toApproximatelyEqual(1);
            expect(port.dir.y).toApproximatelyEqual(0);
        });
        test("Rotation", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c] = PlaceAt(V(0, 0)), port = GetPort(c);

            c.angle = Math.PI / 2;

            expect(port.originPos.x).toApproximatelyEqual(0);
            expect(port.originPos.y).toApproximatelyEqual(0);
            expect(port.targetPos.x).toApproximatelyEqual(0);
            expect(port.targetPos.y).toApproximatelyEqual(1);
            expect(port.dir.x).toApproximatelyEqual(0);
            expect(port.dir.y).toApproximatelyEqual(1);
        });
    });

    describe("Connections", () => {
        test("connections", () => {
            const [circuit, _, { PlaceAt }] = CreateTestRootCircuit([{ "": 2 }]);
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
            const [circuit, _, { PlaceAt }] = CreateTestRootCircuit([{ "": 2 }]);
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));

            c2.setNumPorts("", 2);
            const p1 = c1.ports[""][0];
            const p2 = c2.ports[""][0];
            const p3 = c2.ports[""][1];

            p1.connectTo(p2);

            expect(p1.connectedPorts).toHaveLength(1);
            expect(p1.connectedPorts).toContainObjs([p2]);
            expect(p2.connectedPorts).toHaveLength(1);
            expect(p2.connectedPorts).toContainObjs([p1]);
            expect(p3.connectedPorts).toHaveLength(0);
        });
        test("use same port twice", () => {
            const [circuit, _, { PlaceAt }] = CreateTestRootCircuit([{ "": 2 }]);
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
            expect(p2.connectedPorts).toContainObjs([p1]);
            expect(p3.connectedPorts).toHaveLength(1);
            expect(p3.connectedPorts).toContainObjs([p1]);
            expect(p1.connections).toHaveLength(2);
            expect(p2.connections).toHaveLength(1);
            expect(p3.connections).toHaveLength(1);
        });
        test("connected to self", () => {
            const [circuit, _, { PlaceAt }] = CreateTestRootCircuit([{ "": 2 }]);
            const [c1] = PlaceAt(V(0, 0));

            c1.setNumPorts("", 2);
            const p1 = c1.ports[""][0];
            const p2 = c1.ports[""][1];

            p1.connectTo(p1);

            // Decided 2025-2-28 that a port connecting to itself would only count one connection
            expect(p1.connections).toHaveLength(1);
            expect(p2.connections).toHaveLength(0);
            expect(p1.connectedPorts).toHaveLength(1);
            expect(p1.connectedPorts).toContainObjs([p1]);
            expect(p2.connectedPorts).toHaveLength(0);
        });
    });

    // TODO: Do we even want this in the API
    // describe("Path", () => {
    //     ///
    // });

    describe("Get Legal Wires", () => {
        test("can connect to self", () => {
            const [circuit, _, { PlaceAt, GetPort }] = CreateTestRootCircuit();
            const [c1] = PlaceAt(V(0, 0)), port = GetPort(c1);

            expect(port.canConnectTo(port)).toBeTruthy();
            port.connectTo(port);
            expect(port.isAvailable).toBeTruthy();
            expect(port.canConnectTo(port)).toBeTruthy();
        });
    });
});
