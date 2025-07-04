/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "tests/helpers/Extensions";

import {V} from "Vector";

import {Circuit, Obj} from "shared/api/circuit/public";

import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Circuit", () => {
    // test("begin/commit/cancelTransaction", () => {
    //     const [circuit, _] = CreateTestCircuit();

    //     expect(circuit.beginTransaction()).not.toThrow();
    // });
    describe("Metadata", () => {
        const captureState = (circuit: Circuit) => ({
            id:   circuit.id,
            name: circuit.name,
            desc: circuit.desc,
        } as const);
        test("id", () => {
            const [circuit1] = CreateTestCircuit();
            const [circuit2] = CreateTestCircuit();

            expect(circuit1.id).not.toBe(circuit2.id);
        });
        test("name", () => {
            const [circuit] = CreateTestCircuit();

            const state = captureState(circuit);
            expect(circuit.name).toBe("");
            circuit.name = "Circuit 1";
            expect(circuit.id).toBe(state.id);
            expect(circuit.name).toBe("Circuit 1");
            expect(circuit.desc).toBe(state.desc);
        });
        test("desc", () => {
            const [circuit] = CreateTestCircuit();

            const state = captureState(circuit);
            expect(circuit.desc).toBe("");
            circuit.desc = "Circuit 1";
            expect(circuit.id).toBe(state.id);
            expect(circuit.name).toBe(state.name);
            expect(circuit.desc).toBe("Circuit 1");
        });
    });

    test("selections", () => {
        const [circuit, _] = CreateTestCircuit();

        expect(circuit.selections).toBeDefined();
        expect(circuit.selections).toBe(circuit.selections);
    });

    describe("Pick", () => {
        // TODO: testing overlapping components and zIndex
        test("pickObjAt", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2, c3] = PlaceAt(V(0, 0), V(10, 0), V(5, 0)),
                            w = Connect(c, c2);

            // No objects here
            expect(circuit.pickObjAt(V(0,  5))).toBeUndefined();
            expect(circuit.pickObjAt(V(-2, 0))).toBeUndefined();
            expect(circuit.pickObjAt(V(12, 0))).toBeUndefined();

            // Connected components (c, c2) and wire (w)
            expect(circuit.pickObjAt(V(0,  0))).toBeObj(c);
            expect(circuit.pickObjAt(V(10, 0))).toBeObj(c2);
            expect(circuit.pickObjAt(V(3,  0))).toBeObj(w);

            // Ports
            expect(circuit.pickObjAt(V(1,  0))).toBeObj(GetPort(c));
            expect(circuit.pickObjAt(V(11, 0))).toBeObj(GetPort(c2));
            expect(circuit.pickObjAt(V(6,  0))).toBeObj(GetPort(c3));

            // Component always ontop of wire
            expect(circuit.pickObjAt(V(5, 0))).toBeObj(c3);
        });
        test("pickComponentAt", () => {
            const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

            const [c0, c, c2, c3, c4] = PlaceAt(V(1, 0), V(0, 0), V(10, 0), V(5, 0), V(6, 0)),
                                    w = Connect(c, c2);

            // No objects here
            expect(circuit.pickComponentAt(V(0,  5))).toBeUndefined();
            expect(circuit.pickComponentAt(V(-2, 0))).toBeUndefined();
            expect(circuit.pickComponentAt(V(12, 0))).toBeUndefined();

            // Connected components (c, c2) and wire (w)
            expect(circuit.pickComponentAt(V(0,  0))).toBeObj(c);
            expect(circuit.pickComponentAt(V(10, 0))).toBeObj(c2);
            expect(circuit.pickComponentAt(V(3,  0))).toBeUndefined();

            // Ports
            expect(circuit.pickComponentAt(V(1,  0))).toBeObj(c0);
            expect(circuit.pickComponentAt(V(11, 0))).toBeUndefined();
            expect(circuit.pickComponentAt(V(6,  0))).toBeObj(c4);

            // Component always ontop of wire
            expect(circuit.pickComponentAt(V(5, 0))).toBeObj(c3);
        });
        test("pickComponentAt - overlapping", () => {
            const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

            const [c1, c2] = PlaceAt(V(0, 0), V(0, 0));

            expect(circuit.pickComponentAt(V(0,  0))).toBeObj(c2);
        });
        test("pickWireAt", () => {
            const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

            const [c0, c, c2, c3, c4] = PlaceAt(V(1, 0), V(0, 0), V(10, 0), V(5, 0), V(6, 0)),
                                    w = Connect(c, c2);

            // No objects here
            expect(circuit.pickWireAt(V(0,  5))).toBeUndefined();
            expect(circuit.pickWireAt(V(-2, 0))).toBeUndefined();
            expect(circuit.pickWireAt(V(12, 0))).toBeUndefined();

            // Connected components (c, c2) and wire (w)
            expect(circuit.pickWireAt(V(0,  0))).toBeUndefined();
            expect(circuit.pickWireAt(V(10, 0))).toBeObj(w);
            expect(circuit.pickWireAt(V(3,  0))).toBeObj(w);

            // Ports
            expect(circuit.pickWireAt(V(1,  0))).toBeObj(w);
            expect(circuit.pickWireAt(V(11, 0))).toBeObj(w);
            expect(circuit.pickWireAt(V(6,  0))).toBeObj(w);

            // Component always ontop of wire
            expect(circuit.pickWireAt(V(5, 0))).toBeObj(w);
        });
        test("pickPortAt", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c0, c, c2, c3, c4] = PlaceAt(V(1, 0), V(0, 0), V(10, 0), V(5, 0), V(6, 0)),
                                    w = Connect(c, c2);

            // No objects here
            expect(circuit.pickPortAt(V(0,  5))).toBeUndefined();
            expect(circuit.pickPortAt(V(-2, 0))).toBeUndefined();
            expect(circuit.pickPortAt(V(12, 0))).toBeUndefined();

            // Connected components (c, c2) and wire (w)
            expect(circuit.pickPortAt(V(0,  0))).toBeUndefined();
            expect(circuit.pickPortAt(V(10, 0))).toBeUndefined();
            expect(circuit.pickPortAt(V(3,  0))).toBeUndefined();

            // Ports
            expect(circuit.pickPortAt(V(1,  0))).toBeObj(GetPort(c));
            expect(circuit.pickPortAt(V(11, 0))).toBeObj(GetPort(c2));
            expect(circuit.pickPortAt(V(6,  0))).toBeObj(GetPort(c3));

            // Component always ontop of wire
            expect(circuit.pickPortAt(V(5, 0))).toBeUndefined();
        });
    });

    describe("Get", () => {
        test("getObj", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(10, 0)),
                        w = Connect(c, c2);

            expect(circuit.getObj("")).toBeUndefined();
            expect(circuit.getObj("ASDF")).toBeUndefined();
            expect(circuit.getObj(c.id)).toBeObj(c);
            expect(circuit.getObj(c2.id)).toBeObj(c2);
            expect(circuit.getObj(w.id)).toBeObj(w);
            expect(circuit.getObj(GetPort(c).id)).toBeObj(GetPort(c));
            expect(circuit.getObj(GetPort(c2).id)).toBeObj(GetPort(c2));
        });
        test("getComponent", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(10, 0)),
                        w = Connect(c, c2);

            expect(circuit.getComponent("")).toBeUndefined();
            expect(circuit.getComponent("ASDF")).toBeUndefined();
            expect(circuit.getComponent(c.id)).toBeObj(c);
            expect(circuit.getComponent(c2.id)).toBeObj(c2);
            expect(circuit.getComponent(w.id)).toBeUndefined();
            expect(circuit.getComponent(GetPort(c).id)).toBeUndefined();
            expect(circuit.getComponent(GetPort(c2).id)).toBeUndefined();
        });
        test("getWire", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(10, 0)),
                        w = Connect(c, c2);

            expect(circuit.getWire("")).toBeUndefined();
            expect(circuit.getWire("ASDF")).toBeUndefined();
            expect(circuit.getWire(c.id)).toBeUndefined();
            expect(circuit.getWire(c2.id)).toBeUndefined();
            expect(circuit.getWire(w.id)).toBeObj(w);
            expect(circuit.getWire(GetPort(c).id)).toBeUndefined();
            expect(circuit.getWire(GetPort(c2).id)).toBeUndefined();
        });
        test("getPort", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(10, 0)),
                        w = Connect(c, c2);

            expect(circuit.getPort("")).toBeUndefined();
            expect(circuit.getPort("ASDF")).toBeUndefined();
            expect(circuit.getPort(c.id)).toBeUndefined();
            expect(circuit.getPort(c2.id)).toBeUndefined();
            expect(circuit.getPort(w.id)).toBeUndefined();
            expect(circuit.getPort(GetPort(c).id)).toBeObj(GetPort(c));
            expect(circuit.getPort(GetPort(c2).id)).toBeObj(GetPort(c2));
        });

        test("getObjs", () => {
            const [circuit, _, { PlaceAt, Connect, GetPort }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(10, 0)),
                        w = Connect(c, c2);

            expect(circuit.getObjs()).toHaveLength(5);
            expect(circuit.getObjs()).toContainObjsExact([c, c2, w, GetPort(c), GetPort(c2)]);
        });
        test("getComponents", () => {
            const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(10, 0)),
                        w = Connect(c, c2);

            expect(circuit.getComponents()).toHaveLength(2);
            expect(circuit.getComponents()).toContainObjsExact([c, c2]);
        });
        test("getWires", () => {
            const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(10, 0)),
                        w = Connect(c, c2);

            expect(circuit.getWires()).toHaveLength(1);
            expect(circuit.getWires()).toContainObjsExact([w]);
        });

        test("getComponentInfo", () => {
            const [circuit, _, {}] = CreateTestCircuit();

            const info = circuit.getComponentInfo("TestComp");

            expect(info!.kind).toBe("TestComp");
            expect(info!.defaultPortConfig).toEqual({ [""]: 1 });
            expect(info!.portGroups).toEqual([""]);

            expect(circuit.getComponentInfo("TestWire")).toBeUndefined();
            expect(circuit.getComponentInfo("ASDF")).toBeUndefined();
        });
    });

    describe("Place", () => {
        test("0, 0", () => {
            const [circuit, _, {}] = CreateTestCircuit();
            const c1 = circuit.placeComponentAt("TestComp", V(0, 0));
            expect(c1.pos).toEqual(V(0, 0));
        });
        test("-5, 16", () => {
            const [circuit, _, { }] = CreateTestCircuit();
            const c1 = circuit.placeComponentAt("TestComp", V(-5, 16));
            expect(c1.pos).toEqual(V(-5, 16));
        });
        test("zIndex increases", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();
            const [c1, c2, c3] = PlaceAt(V(0, 0), V(0, 0), V(0, 0));
            expect(c1.zIndex).toBe(1);
            expect(c2.zIndex).toBe(2);
            expect(c3.zIndex).toBe(3);
        });
    });

    describe("Delete", () => {
        test("Basic Delete 1 Component", () => {
            const [circuit, _, { PlaceAt }] = CreateTestCircuit();

            const [c] = PlaceAt(V(0, 0));

            expect(circuit.getObjs()).toHaveLength(2);

            circuit.deleteObjs([c]);

            expect(circuit.getObjs()).toHaveLength(0);
            expect(circuit.getObj(c.id)).toBeUndefined();
            expect(() => c.setProp("name", "test")).toThrow();
        });
        test("Basic Delete 1 Wire", () => {
            const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(5, 0)),
                        w = Connect(c, c2);

            expect(circuit.getObjs()).toHaveLength(5);

            circuit.deleteObjs([w]);

            expect(circuit.getObjs()).toHaveLength(4);
            expect(circuit.getObj(w.id)).toBeUndefined();
            expect(() => w.setProp("name", "test")).toThrow();
        });
        test("Delete 2 objs with a Wire", () => {
            const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

            const [c, c2] = PlaceAt(V(0, 0), V(5, 0)),
                        w = Connect(c, c2);

            expect(circuit.getObjs()).toHaveLength(5);

            circuit.deleteObjs([c, c2]);

            expect(circuit.getObjs()).toHaveLength(0);
            expect(circuit.getObj(c.id)).toBeUndefined();
            expect(() => c.setProp("name", "test")).toThrow();
            expect(circuit.getObj(w.id)).toBeUndefined();
            expect(() => w.setProp("name", "test")).toThrow();
        });
        test("Delete Wire path", () => {
            const [circuit, _, {PlaceAt, Connect}] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            const {node: n1, wire1: sw1, wire2: sw2} = w1.split();
            circuit.deleteObjs([sw1]);

            expect(circuit.getComponents()).toHaveLength(2);
            expect(circuit.getWires()).toHaveLength(0);
        });
        test("Delete Node path", () => {
            const [circuit, _, {PlaceAt, Connect}] = CreateTestCircuit();
            const [c1, c2] = PlaceAt(V(0, 0), V(1, 1)), w1 = Connect(c1, c2);

            const {node: n1, wire1: sw1, wire2: sw2} = w1.split();
            circuit.deleteObjs([n1]);

            expect(circuit.getComponents()).toHaveLength(2);
            expect(circuit.getWires()).toHaveLength(0);
        });
    });

    describe("Undo/Redo", () => {
        describe("Place Component", () => {
            test("Basic 1 Component", () => {
                const [circuit, { internal }, { PlaceAt }] = CreateTestCircuit();
                const log = internal["log"];

                let logCount = 0;
                log.subscribe((ev) => (ev.accepted.length > 0 ? logCount++ : 0));

                const [c] = PlaceAt(V(0, 0));

                expect(circuit.getObjs()).toHaveLength(2);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(logCount).toBe(1);

                circuit.undo();

                expect(circuit.getObjs()).toHaveLength(0);
                expect(circuit.getObj(c.id)).toBeUndefined();
                expect(logCount).toBe(2);
                // Need to make sure that any errors that are thrown cancel transactions or something!
                // expect(() => c.setProp("name", "test")).toThrow();

                circuit.redo();

                expect(circuit.getObjs()).toHaveLength(2);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(logCount).toBe(3);
            });
            test("Basic 2 Components in transaction", () => {
                const [circuit, { internal }, { PlaceAt }] = CreateTestCircuit();
                const log = internal["log"];

                let logCount = 0;
                log.subscribe((ev) => (ev.accepted.length > 0 ? logCount++ : 0));

                circuit.beginTransaction();
                const [c, c2] = PlaceAt(V(0, 0), V(5, 0));
                expect(logCount).toBe(0);
                circuit.commitTransaction();

                expect(circuit.getObjs()).toHaveLength(4);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(logCount).toBe(1);

                circuit.undo()

                expect(circuit.getObjs()).toHaveLength(0);
                expect(circuit.getObj(c.id)).toBeUndefined();
                expect(circuit.getObj(c2.id)).toBeUndefined();
                expect(logCount).toBe(2);
                // expect(() => c.setProp("name", "test")).toThrow();
                // expect(() => c2.setProp("name", "test")).toThrow();

                circuit.redo();

                expect(circuit.getObjs()).toHaveLength(4);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(logCount).toBe(3);
            });
            test("Basic 2 Components in succession", () => {
                const [circuit, { internal }, { PlaceAt }] = CreateTestCircuit();
                const log = internal["log"];

                let logCount = 0;
                log.subscribe((ev) => (ev.accepted.length > 0 ? logCount++ : 0));

                const [c] = PlaceAt(V(0, 0));
                const [c2] = PlaceAt(V(5, 0));

                expect(circuit.getObjs()).toHaveLength(4);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(logCount).toBe(2);

                circuit.undo();

                expect(circuit.getObjs()).toHaveLength(2);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeUndefined();
                expect(() => c2.setProp("name", "test")).toThrow();
                expect(logCount).toBe(3);

                circuit.redo();

                expect(circuit.getObjs()).toHaveLength(4);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(logCount).toBe(4);

                circuit.undo();

                expect(circuit.getObjs()).toHaveLength(2);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeUndefined();
                expect(() => c2.setProp("name", "test")).toThrow();
                expect(logCount).toBe(5);

                circuit.undo();

                expect(circuit.getObjs()).toHaveLength(0);
                expect(circuit.getObj(c.id)).toBeUndefined();
                expect(circuit.getObj(c2.id)).toBeUndefined();
                expect(() => c.setProp("name", "test")).toThrow();
                expect(() => c2.setProp("name", "test")).toThrow();
                expect(logCount).toBe(6);
            });
        });

        describe("Connect Wire", () => {
            test("Basic 1 Wire", () => {
                const [circuit, { internal }, { PlaceAt, Connect }] = CreateTestCircuit();
                const log = internal["log"];

                let logCount = 0;
                log.subscribe((ev) => (ev.accepted.length > 0 ? logCount++ : 0));

                const [c, c2] = PlaceAt(V(0, 0), V(5, 0)),
                            w = Connect(c, c2);

                expect(circuit.getObjs()).toHaveLength(5);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(circuit.getObj(w.id)).toBeObj(w);
                expect(logCount).toBe(3);

                circuit.undo()

                expect(circuit.getObjs()).toHaveLength(4);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(circuit.getObj(w.id)).toBeUndefined();
                expect(() => w.setProp("name", "test")).toThrow();
                expect(logCount).toBe(4);

                circuit.redo();

                expect(circuit.getObjs()).toHaveLength(5);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(circuit.getObj(w.id)).toBeObj(w);
                expect(logCount).toBe(5);
            });
            test("Components and Wire creation in transaction", () => {
                const [circuit, { internal }, { PlaceAt, Connect }] = CreateTestCircuit();
                const log = internal["log"];

                let logCount = 0;
                log.subscribe((ev) => (ev.accepted.length > 0 ? logCount++ : 0));

                circuit.beginTransaction();
                const [c, c2] = PlaceAt(V(0, 0), V(5, 0)),
                            w = Connect(c, c2);
                circuit.commitTransaction();

                expect(circuit.getObjs()).toHaveLength(5);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(circuit.getObj(w.id)).toBeObj(w);
                expect(logCount).toBe(1);

                circuit.undo();

                expect(circuit.getObjs()).toHaveLength(0);
                expect(circuit.getObj(c.id)).toBeUndefined();
                expect(circuit.getObj(c2.id)).toBeUndefined();
                expect(circuit.getObj(w.id)).toBeUndefined();
                expect(() => c.setProp("name", "test")).toThrow();
                expect(() => c2.setProp("name", "test")).toThrow();
                expect(() => w.setProp("name", "test")).toThrow();
                expect(logCount).toBe(2);

                circuit.redo();

                expect(circuit.getObjs()).toHaveLength(5);
                expect(circuit.getObj(c.id)).toBeObj(c);
                expect(circuit.getObj(c2.id)).toBeObj(c2);
                expect(circuit.getObj(w.id)).toBeObj(w);
                expect(logCount).toBe(3);
            });
        });

        // TODO: All other operations
    });

    // TODO: Is this just redundant with select all then copy selection?
    // describe("Copy", () => {
    //     function expectObjsToBeSame(o1: Obj, o2: Obj) {
    //         expect(o1.baseKind).toEqual(o2.baseKind);
    //         expect(o1.kind).toEqual(o2.kind);
    //         expect(o1.getProps()).toEqual(o2.getProps());
    //         if (o1.baseKind === "Port" && o2.baseKind === "Port") {
    //             expect(o1.group).toEqual(o2.group);
    //             expect(o1.index).toEqual(o2.index);
    //         }
    //     }

    //     test("Basic Circuit Copy", () => {
    //         const [circuit, _, { PlaceAt, Connect }] = CreateTestCircuit();

    //         const [c1, c2, c3] = PlaceAt(V(0, -5), V(0, 5), V(5, 0));
    //         const w1 = Connect(c1, c2),
    //               w2 = Connect(c2, c3),
    //               w3 = Connect(c3, c1);

    //         c1.name = "Comp 1";
    //         c2.name = "Comp 2";
    //         c3.name = "Comp 3";
    //         w1.name = "Wire 1";
    //         w2.name = "Wire 2";
    //         w3.name = "Wire 3";

    //         const circuit2 = circuit.copy();

    //         expect(circuit2.getObjs()).toHaveLength(circuit.getObjs().length);

    //         const c1_2 = circuit2.pickComponentAt(V(0, -5))!,
    //               c2_2 = circuit2.pickComponentAt(V(0,  5))!,
    //               c3_2 = circuit2.pickComponentAt(V(5,  0))!;
    //         expectObjsToBeSame(c1_2, c1);
    //         expectObjsToBeSame(c2_2, c2);
    //         expectObjsToBeSame(c3_2, c3);

    //         const w1_2 = circuit2.pickWireAt(V(0,  0))!,
    //               w2_2 = circuit2.pickWireAt(V(3,  2))!,
    //               w3_2 = circuit2.pickWireAt(V(3, -2))!;
    //         expectObjsToBeSame(w1_2, w1);
    //         expectObjsToBeSame(w2_2, w2);
    //         expectObjsToBeSame(w3_2, w3);
    //     });
    // });


});
