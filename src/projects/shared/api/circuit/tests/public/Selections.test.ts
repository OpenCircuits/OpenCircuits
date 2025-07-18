/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {Circuit, Component, Obj, Wire} from "shared/api/circuit/public";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";
import {Rect} from "math/Rect";


// NOTE: For (most) of these, make sure the `SelectionsEvent` fires correctly
describe("Selections", () => {
    describe("Basic Queries", () => {
        test(".isEmpty", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1] = PlaceAt(V(0, 0));
            expect(selections.isEmpty).toBeTruthy();
            c1.select();
            expect(selections.isEmpty).toBeFalsy();
            circuit.undo();
            expect(selections.isEmpty).toBeTruthy();
            circuit.redo();
            expect(selections.isEmpty).toBeFalsy();
        });
        test(".length", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1] = PlaceAt(V(0, 0));
            expect(selections).toHaveLength(0);
            c1.select();
            expect(selections).toHaveLength(1);
            circuit.undo();
            expect(selections).toHaveLength(0);
            circuit.redo();
            expect(selections).toHaveLength(1);
        });
        test(".filter()", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            c1.select();
            c1.name = "filterMe";
            c2.select();
            const filtered = selections.filter((obj) => obj.name === "filterMe");
            expect(filtered).toHaveLength(1);
            expect(filtered[0]).toBeObj(c1);
        });
        test(".every()", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            c1.select();
            c1.name = "filterMe";
            c2.select();
            expect(selections.every((obj) => obj.name === "filterMe")).toBeFalsy();
            expect(selections.every((obj) => obj.kind === "TestComp")).toBeTruthy();
        });
    });

    describe("Observe", () => {
        test("Basic selecting and undo/redo", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            let observedCount = 0;
            selections.subscribe(() => {observedCount++});
            c1.select();
            expect(observedCount).toBe(1);
            c2.select();
            expect(observedCount).toBe(2);
            circuit.undo();
            circuit.undo();
            circuit.redo();
            circuit.redo();
            expect(observedCount).toBe(6);
        });
    });

    describe("Obj Queries", () => {
        const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
        const selections = circuit.selections;
        const [c1, c2, c3] = PlaceAt(V(0, 0), V(1, 1), V(2, 2));
        const w1 = Connect(c1, c2);
        const w2 = Connect(c1, c3);
        const p1 = GetPort(c1);
        const p2 = GetPort(c2);
        const p3 = GetPort(c3);
        c1.select();
        c2.select();
        p3.select();
        w1.select();
        test(".all", () => {
            expect(selections.all).toHaveLength(4);
            expect(selections.all).toContainObjsExact([c1, c2, p3, w1]);
        });
        test(".components", () => {
            expect(selections.components).toHaveLength(2);
            expect(selections.components).toContainObjsExact([c1, c2]);
        });
        test(".wires", () => {
            expect(selections.wires).toHaveLength(1);
            expect(selections.wires).toContainObjs([w1]);
        });
    });

    describe("Midpoint", () => {
        test("2 components selected", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1, c2] = PlaceAt(V(0, 0), V(2, 2));
            c1.select();
            c2.select();
            expect(selections.bounds).toEqual(Rect.From({ cx: 1, cy: 1, width: 3, height: 3 }));
        });
        test("6 components selected", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1, c2, c3, c4, c5, c6] = PlaceAt(V(0, 0), V(2, 2), V(0, 1), V(2, 1), V(1, 0), V(1, 2));
            c1.select();
            c2.select();
            c3.select();
            c4.select();
            c5.select();
            c6.select();
            expect(selections.bounds).toEqual(Rect.From({ cx: 1, cy: 1, width: 3, height: 3 }));
        });
        test("Use bounding box midpoint, not weighted average", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1, c2, c3] = PlaceAt(V(0, 0), V(2, 2), V(0, 0));
            c1.select();
            c2.select();
            c3.select();
            expect(selections.bounds).toEqual(Rect.From({ cx: 1, cy: 1, width: 3, height: 3 }));
        });
    });

    describe("withWiresAndPorts", () => {
        test("Single component", () => {
            const [{ selections }, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c] = PlaceAt(V(0, 0));
            c.select();

            const container = selections.withWiresAndPorts();

            expect(container.components).toHaveLength(1);
            expect(container.ports).toHaveLength(1);
            expect(container.wires).toHaveLength(0);
            expect(container.all).toHaveLength(2);
        });
        test("Multiple components connected to eachother", () => {
            const [{ selections }, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(2, 0));
            Connect(c, c2);
            c.select();
            c2.select();

            const container = selections.withWiresAndPorts();

            expect(container.components).toHaveLength(2);
            expect(container.ports).toHaveLength(2);
            expect(container.wires).toHaveLength(1);
            expect(container.all).toHaveLength(5);
        });
        test("Single component connected to another component", () => {
            const [{ selections }, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(2, 0));
            Connect(c, c2);
            c.select();

            const container = selections.withWiresAndPorts();

            expect(container.components).toHaveLength(1);
            expect(container.ports).toHaveLength(1);
            expect(container.wires).toHaveLength(0);
            expect(container.all).toHaveLength(2);
        });
    });

    describe("Clear", () => {
        test("Basic with undo/redo", () => {
            const [circuit, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();
            const selections = circuit.selections;
            const [c1, c2, c3] = PlaceAt(V(0, 0), V(1, 1), V(2, 2));
            const w1 = Connect(c1, c2);
            const w2 = Connect(c1, c3);
            const p1 = GetPort(c1);
            const p2 = GetPort(c2);
            const p3 = GetPort(c3);
            c1.select();
            c2.select();
            p3.select();
            w1.select();
            expect(selections.all).toHaveLength(4);
            expect(selections.all).toContainObjsExact([c1, c2, p3, w1]);
            selections.clear();
            expect(selections.all).toHaveLength(0);
            circuit.undo();
            expect(selections.all).toHaveLength(4);
            expect(selections.all).toContainObjsExact([c1, c2, p3, w1]);
            circuit.redo();
            expect(selections.all).toHaveLength(0);
        });
    });

    describe("Deleting selected objects", () => {
        test("Deleted object also is deselected", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            c1.select();
            c2.select();
            circuit.deleteObjs([c1]);
            expect(circuit.selections).toHaveLength(1);

            circuit.undo();
            expect(c1.isSelected).toBeTruthy();
            expect(circuit.selections).toHaveLength(2);

            circuit.redo();
            expect(circuit.selections).toHaveLength(1);
        });
        test("Observer is triggered", () => {
            const [circuit, { PlaceAt, GetPort }] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
            c1.select();
            c2.select();
            let observedCount = 0;
            circuit.selections.subscribe(() => {observedCount++});
            circuit.deleteObjs([c1]);
            expect(observedCount).toBe(1);
            circuit.undo();
            expect(observedCount).toBe(2);
            circuit.redo();
            expect(observedCount).toBe(3);
        });
    });

    // describe("Duplicate", () => {
    //     test("Basic component duplication", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2, c3] = PlaceAt(V(0, 0), V(1, 1), V(2, 2));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         c1.select();
    //         c2.select();
    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(2);
    //         expect(duplicates.some(comp => comp.name === "Component 1")).toBeTruthy();
    //         expect(duplicates.some(comp => comp.name === "Component 2")).toBeTruthy();
    //         expect(duplicates.some(comp => comp.id === c1.id || comp.id === c2.id)).toBeFalsy();

    //         // selection shouldn't be modified by `.duplicate()`, it is up to the caller handle that
    //         expect(selections).toHaveLength(2);
    //         expect(selections.all).toContainObjsExact([c1, c2]);

    //         circuit.undo();
    //         expect(duplicates).toHaveLength(2);
    //         expect(duplicates.every(comp => !comp.exists()));
    //         circuit.redo();
    //         expect(duplicates).toHaveLength(2);
    //         expect(duplicates.every(comp => comp.exists()));
    //     });
    //     test("Connected components, no wire selected", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const w1 = Connect(c1, c2);
    //         w1.name = "Wire 1";
    //         c1.select();
    //         c2.select();
    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(2);
    //         expect(duplicates.some(obj => obj.name === "Component 1")).toBeTruthy();
    //         expect(duplicates.some(obj => obj.name === "Component 2")).toBeTruthy();

    //         const dc1 = duplicates[0] as Component;
    //         const dc2 = duplicates[1] as Component;
    //         expect(dc1.baseKind).toBe("Component");
    //         expect(dc2.baseKind).toBe("Component");
    //         const dw1 = dc1.ports[""][0].connections[0]
    //         expect(dw1.name).toBe("Wire 1");
    //         expect(dw1.id).not.toBe(w1.id);
    //     });
    //     test("Connected components, wire selected", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const w1 = Connect(c1, c2);
    //         w1.name = "Wire 1";
    //         c1.select();
    //         c2.select();
    //         w1.select();
    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(3);
    //         expect(duplicates.some(obj => obj.name === "Component 1")).toBeTruthy();
    //         expect(duplicates.some(obj => obj.name === "Component 2")).toBeTruthy();
    //         expect(duplicates.some(obj => obj.name === "Wire 1")).toBeTruthy();

    //         const dw1 = duplicates.find(obj => obj.baseKind === "Wire") as Wire;
    //         expect(dw1).toBeDefined();
    //         expect(dw1.id).not.toBe(w1.id);
    //     });
    //     test("Component and port selected", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2, c3] = PlaceAt(V(0, 0), V(1, 1), V(2, 2));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const p1 = c1.ports[""][0];
    //         p1.name = "Port 1";
    //         c1.select();
    //         p1.select();
    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(2);
    //         expect(duplicates.some(comp => comp.name === "Port 1")).toBeTruthy();
    //     });
    //     test("Component and port on other component selected", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2, c3] = PlaceAt(V(0, 0), V(1, 1), V(2, 2));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const p1 = c1.ports[""][0];
    //         p1.name = "Port 1";
    //         c2.select();
    //         p1.select();
    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(1);
    //         expect(duplicates.some(comp => comp.name === "Component 2")).toBeTruthy();
    //     });
    //     test("One component and wire selected", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const w1 = Connect(c1, c2);
    //         w1.name = "Wire 1";
    //         c1.select();
    //         w1.select();
    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(1);
    //         expect(duplicates.some(obj => obj.name === "Component 1")).toBeTruthy();

    //         const dc1 = duplicates[0] as Component;
    //         expect(dc1.ports[""][0].connections).toHaveLength(0);
    //     });
    //     test("Ports, wires, and nodes selected only", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const w1 = Connect(c1, c2);
    //         const {node: n1, wire1: sw1, wire2: sw2} = w1.split();
    //         const p1 = c1.ports[""][0]
    //         p1.name = "Port 1";
    //         sw1.select();
    //         sw2.select();
    //         n1.select();
    //         p1.select();

    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(0);
    //     });
    //     test("Connected components with split wire, node selected", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const w1 = Connect(c1, c2);
    //         const {node: n1} = w1.split();
    //         n1.name = "Node 1";
    //         c1.select();
    //         c2.select();
    //         n1.select();

    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(3);
    //         expect(duplicates.some(comp => comp.name === "Node 1")).toBeTruthy();
    //         const dn1 = duplicates.find(comp => comp.name === "Node 1")!;
    //         expect(dn1.id).not.toBe(n1.id);
    //     });
    //     test("Connected components with split wire, node unselected", () => {
    //         const [{selections, undo, redo}, { }, {PlaceAt, Connect, GetPort}] = CreateTestCircuit();
    //         const [c1, c2] = PlaceAt(V(0, 0), V(1, 1));
    //         c1.name = "Component 1";
    //         c2.name = "Component 2";
    //         const w1 = Connect(c1, c2);
    //         const {node: n1} = w1.split();
    //         n1.name = "Node 1";
    //         c1.select();
    //         c2.select();

    //         const duplicates = selections.duplicate();
    //         expect(duplicates).toHaveLength(2);

    //         const dc1 = duplicates[0] as Component;
    //         const dc2 = duplicates[1] as Component;
    //         expect(dc1.baseKind).toBe("Component");
    //         expect(dc2.baseKind).toBe("Component");
    //         expect(dc1.ports[""][0].connectedPorts[0].parent).toBe(dc2.ports[""][0].connectedPorts[0].parent);
    //     });
    // });
});
