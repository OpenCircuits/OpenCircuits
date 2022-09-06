import {CopyGroup, CreateGroup,
        GatherGroup} from "core/utils/ComponentUtils";

import {GetInvertedGate} from "digital/utils/ComponentUtils";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {DigitalObjectSet} from "digital/models/DigitalObjectSet";
import {DigitalWire}      from "digital/models/DigitalWire";

import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {ORGate}  from "digital/models/ioobjects/gates/ORGate";

import {Button} from "digital/models/ioobjects/inputs/Button";
import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";
import {IC}          from "digital/models/ioobjects/other/IC";
import {ICData}      from "digital/models/ioobjects/other/ICData";

import {LED}            from "digital/models/ioobjects/outputs/LED";
import {SegmentDisplay} from "digital/models/ioobjects/outputs/SegmentDisplay";


function Connect(c1: DigitalComponent, i1: number, c2?: DigitalComponent, i2?: number): DigitalWire {
    const p1 = c1.getOutputPort(i1);
    const p2 = c2!.getInputPort(i2!);
    const wire = new DigitalWire(p1, p2);
    p1.connect(wire);
    p2.connect(wire);
    return wire;
}

describe("CreateGroup", () => {
    test("Group 0", () => {
        const group = CreateGroup([]);

        expect(group.getWires()).toHaveLength(0);
        expect(group.getComponents()).toHaveLength(0);
    });
    test("Group 1", () => {
        const i1 = new Switch();
        const i2 = new Switch();
        const g  = new ANDGate();
        const o1 = new LED();

        Connect(i1, 0,  g, 0);
        Connect(i2, 0,  g, 1);
        Connect(g,  0, o1, 0);

        const group = CreateGroup([i1,i2,g,o1]);

        expect(group.getWires()).toHaveLength(3);
        expect(group.getComponents()).toHaveLength(4);
    });
    test("Group 2", () => {
        const i1 = new Switch();
        const i2 = new Button();
        const g  = new ORGate();
        const o1 = new LED();

        const group = CreateGroup([i1,i2,g,o1]);

        Connect(i1, 0,  g, 0);
        Connect(i2, 0,  g, 1);
        Connect(g,  0, o1, 0);

        expect(group.getWires()).toHaveLength(0);
        expect(group.getComponents()).toHaveLength(4);
    });

});

describe("GetAllOutgoingPaths", () => {
    describe("Group 1", () => {
        const gate = new ANDGate();

        const wire = Connect(gate, 0,  gate, 0);

        test("Gather Gate", () => {
            const group = GatherGroup([gate]);

            expect(group.getWires()).toHaveLength(1);
            expect(group.getWires()[0]).toBe(wire);
        });
    });

    describe("Group 2", () => {
        const gate = new ANDGate();
        const wp = new DigitalNode();

        const wire1 = Connect(gate, 0,  wp,   0);
        const wire2 = Connect(wp,   0,  gate, 0);

        test("Gather Gate", () => {
            const group = GatherGroup([gate]);

            expect(group.getWires()).toHaveLength(2);
            expect(group.getWires()).toContain(wire1);
            expect(group.getWires()).toContain(wire2);
        });
        test("Gather WirePort", () => {
            const removed = GatherGroup([wp]);

            const components = removed.getComponents();
            const wires = removed.getWires();

            expect(components).toHaveLength(1);
            expect(wires).toHaveLength(2);
            expect(components[0]).toBe(wp);
            expect(wires).toContain(wire1);
            expect(wires).toContain(wire2);
        });
        test("Gather Wire1", () => {
            const removed = GatherGroup([wire1]);

            const components = removed.getComponents();
            const wires = removed.getWires();

            expect(components).toHaveLength(1);
            expect(wires).toHaveLength(2);
            expect(components[0]).toBe(wp);
            expect(wires).toContain(wire1);
            expect(wires).toContain(wire2);
        });
        test("Gather Wire2", () => {
            const removed = GatherGroup([wire2]);

            const components = removed.getComponents();
            const wires = removed.getWires();

            expect(components).toHaveLength(1);
            expect(wires).toHaveLength(2);
            expect(components[0]).toBe(wp);
            expect(wires).toContain(wire1);
            expect(wires).toContain(wire2);
        });
    });

    describe("Group 3", () => {
        const s1 = new Switch();
        const s2 = new Switch();
        const gate = new ANDGate();
        const l = new LED();
        const wp1 = new DigitalNode();
        const wp2 = new DigitalNode();
        const wp3 = new DigitalNode();

        const wire1 = Connect(s1, 0,  wp1, 0);
        const wire2 = Connect(s2, 0,  wp2, 0);

        const wire3 = Connect(wp1, 0,  gate, 0);
        const wire4 = Connect(wp2, 0,  gate, 1);

        const wire5 = Connect(gate, 0,  wp3, 0);

        const wire6 = Connect(wp3, 0,  l, 0);

        test("Gather Gate", () => {
            const removed = GatherGroup([gate]);

            const components = removed.getComponents();
            const wires = removed.getWires();

            expect(components).toHaveLength(4);
            expect(wires).toHaveLength(6);
            expect(components).toContain(gate);
            expect(components).toContain(wp1);
            expect(components).toContain(wp2);
            expect(components).toContain(wp3);
            expect(wires).toContain(wire1);
            expect(wires).toContain(wire2);
            expect(wires).toContain(wire3);
            expect(wires).toContain(wire4);
            expect(wires).toContain(wire5);
            expect(wires).toContain(wire6);
        });
    });
});

describe("CreateGraph", () => {
    // @TODO
});

describe("CopyGroup", () => {
    /**
     * Helper function to expect a full copy with different scenarios.
     *
     * @param types       The list of types of DigitalComponents to create.
     * @param connections The list of connections to connect different components.
     *              Each connection is defined by 4 numbers:
     *              0. The index of the first component (in types).
     *              1. The index of the port from the first component.
     *              2. The index of the second component (in types).
     *              3. The index of the port from the second component.
     */
    function expectCopy(types: Array<new () => DigitalComponent>,
                        connections: Array<[number, number, number, number]>): void {
        const originals = types.map((t) => new t());
        connections.forEach((c) => Connect(originals[c[0]], c[1], originals[c[2]], c[3]));

        const copy = CopyGroup(originals);

        const components = copy.getComponents() as DigitalComponent[];
        const wires = copy.getWires() as DigitalWire[];

        // Expect same amount of componnets/wires
        expect(components).toHaveLength(types.length);
        expect(wires).toHaveLength(connections.length);

        // Expect each component to be instance of the given types
        components.forEach((c, i) => {
            expect(c).toBeInstanceOf(types[i]);
        });

        // Expect each copied component not .toBe the same as the original
        components.forEach((c, i) => {
            expect(c).not.toBe(originals[i]);
        });

        // Expect each connection to be connected to the correct original component
        components.forEach((c, i) => {
            const o = originals[i];
            expect(c.numOutputs()).toBe(o.numOutputs());
            c.getOutputs().forEach((p, j) => {
                const o2 = o.getOutputs()[j].getOutputComponent();
                const i2 = originals.indexOf(o2);
                expect(p.getOutputComponent()).toBe(components[i2]);
            });
            expect(c.numInputs()).toBe(o.numInputs());
            c.getInputs().forEach((p, j) => {
                const o2 = o.getInputs()[j].getInputComponent();
                const i2 = originals.indexOf(o2);
                expect(p.getInputComponent()).toBe(components[i2]);
            });
        });
    }

    test("Group 0", () => {
        expectCopy([], []);
    });
    test("Group 1", () => {
        expectCopy([Switch,     Switch,      ANDGate,      LED],
                   [[0,0,/* ---------------> */2,0            ],
                    [            1,0,/* ---> */2,1            ],
                    [                          2,0,/* -> */3,0]]);
    });
    test("Group 2", () => {
        expectCopy([Switch], []);
    });
    test("Group 3", () => {
        expectCopy([Switch, SegmentDisplay],
                   [[0,0,/* ---> */1,0]]);
    });
    test("Group 4", () => {
        expectCopy([Button,     Button,     ORGate,       LED],
                   [[0,0,/* --------------> */2,0            ],
                    [            1,0,/* --> */2,1            ],
                    [                         2,0,/* -> */3,0]]);
        expectCopy([Switch,     ANDGate,     LED],
                   [[0,0,/* -> */1,0            ],
                    [            1,0,/* -> */2,0]]);
    });
    test("Group 5", () => {
        expectCopy([Button,   Switch,   ORGate,   ORGate,   ANDGate,   SegmentDisplay],
                   [[0,0,/* -----------> */2,0                                  ],
                    [0,0,/* ----------------------> */3,0                       ],
                    [          1,0,/* -> */2,1                                  ],
                    [          1,0,/* ------------> */3,1                       ],
                    [                    2,0,/* -----------> */4,0              ],
                    [                    2,0,/* -------------------------> */5,0],
                    [                    2,0,/* -------------------------> */5,1],
                    [                              3,0,/* -> */4,1              ],
                    [                              3,0,/* ---------------> */5,5],
                    [                              3,0,/* ---------------> */5,6],
                    [                                          3,0,/* ---> */5,2],
                    [                                          3,0,/* ---> */5,3],
                    [                                          3,0,/* ---> */5,4]]);
    });
    test("Group 6", () => {
        expectCopy([Switch,   Button,   DigitalNode,   ANDGate,    DigitalNode,   ORGate,     LED,   SegmentDisplay],
                   [[0,0,/* --------------------------> */3,0                                                   ],
                    [          1,0,/* --> */2,0                                                                 ],
                    [                       2,0,/* ---> */3,1                                                   ],
                    [                                     3,0,/* --> */4,0                                      ],
                    [                                                  4,0,/* ------------> */6,0               ],
                    [                                     3,0,/* ---------------> */5,0                         ],
                    [          1,0,/* -------------------------------------------------------------------> */7,0],
                    [          1,0,/* -------------------------------------------------------------------> */7,3],
                    [          1,0,/* -------------------------------------------------------------------> */7,5]]);
    });
    test("Group 7 - Semi Select", () => {
        const objs = [new Switch(), new LED()];
        Connect(objs[0], 0, objs[1], 0);

        const copy = CopyGroup([objs[0]]); // Just copy switch

        expect(copy.getWires()).toHaveLength(0);
        expect(copy.getComponents()).toHaveLength(1);

        const sCopy = copy.getComponents()[0];

        expect(sCopy).toBeInstanceOf(Switch);
        expect(sCopy.getConnections()).toHaveLength(0);
    });
    test("Group 8 - IC", () => {
        const objs = [new Switch(), new LED()];
        const wire = Connect(objs[0], 0, objs[1], 0);

        const data = new ICData(DigitalObjectSet.From([objs[0], objs[1], wire]));
        const ic = new IC(data);

        const copy = CopyGroup([ic]);

        expect(copy.getWires()).toHaveLength(0);
        expect(copy.getComponents()).toHaveLength(1);

        const icCopy = copy.getComponents()[0];

        expect(icCopy).toBeInstanceOf(IC);
    });
    test("Group 9 - IC in IC", () => {
        const objs = [new Switch(), new LED()];
        const wire = Connect(objs[0], 0, objs[1], 0);

        const data = new ICData(DigitalObjectSet.From([objs[0], objs[1], wire]));
        const ic = new IC(data);

        const objs2 = [new Switch(), new LED()];
        const wire2a = Connect(objs2[0], 0, ic, 0);
        const wire2b = Connect(ic, 0, objs2[1], 0);

        const data2 = new ICData(DigitalObjectSet.From([objs2[0], wire2a, ic, wire2b, objs2[1]]));
        const ic2 = new IC(data2);

        const copy = CopyGroup([ic2]);

        expect(copy.getWires()).toHaveLength(0);
        expect(copy.getComponents()).toHaveLength(1);

        const icCopy = copy.getComponents()[0];

        expect(icCopy).toBeInstanceOf(IC);
    });

    describe("Group 10 - Floating Nodes", () => {
        const objs = [new Switch(), new DigitalNode(), new DigitalNode(), new LED(), new LED()];
        Connect(objs[0], 0, objs[1], 0);
        Connect(objs[1], 0, objs[2], 0);
        Connect(objs[2], 0, objs[3], 0);
        Connect(objs[2], 0, objs[4], 0);

        test("Group 10a - One Node", () => {
            const copy = CopyGroup([objs[1]]);

            expect(copy.getWires()).toHaveLength(0);
            expect(copy.getComponents()).toHaveLength(0);
        });

        test("Group 10b - Two Nodes", () => {
            const copy = CopyGroup([objs[1], objs[2]]);

            expect(copy.getWires()).toHaveLength(0);
            expect(copy.getComponents()).toHaveLength(0);
        });

        test("Group 10c - Switch + Two Nodes", () => {
            const copy = CopyGroup([objs[0], objs[1], objs[2]]);

            expect(copy.getWires()).toHaveLength(0);
            expect(copy.getComponents()).toHaveLength(1);

            const sCopy = copy.getComponents()[0];

            expect(sCopy).toBeInstanceOf(Switch);
            expect(sCopy.getConnections()).toHaveLength(0);
        });

        test("Group 10d - Node with 2 LEDs", () => {
            const copy = CopyGroup([objs[2], objs[3], objs[4]]);

            expect(copy.getWires()).toHaveLength(0);
            expect(copy.getComponents()).toHaveLength(2);

            const l0Copy = copy.getComponents()[0];
            const l1Copy = copy.getComponents()[1];

            expect(l0Copy).toBeInstanceOf(LED);
            expect(l0Copy.getConnections()).toHaveLength(0);
            expect(l1Copy).toBeInstanceOf(LED);
            expect(l1Copy.getConnections()).toHaveLength(0);
        });

        test("Group 10e - Switch with both Nodes and 1 LED", () => {
            const copy = CopyGroup([objs[0], objs[1], objs[2], objs[3]]);

            expect(copy.getWires()).toHaveLength(3);
            expect(copy.getComponents()).toHaveLength(4);

            const sCopy = copy.getComponents()[0];
            const n0Copy = copy.getComponents()[1];
            const n1Copy = copy.getComponents()[2];
            const lCopy = copy.getComponents()[3];

            expect(sCopy).toBeInstanceOf(Switch);
            expect(sCopy.getConnections()).toHaveLength(1);
            expect(n0Copy).toBeInstanceOf(DigitalNode);
            expect(n0Copy.getConnections()).toHaveLength(2);
            expect(n1Copy).toBeInstanceOf(DigitalNode);
            expect(n1Copy.getConnections()).toHaveLength(2);
            expect(lCopy).toBeInstanceOf(LED);
            expect(lCopy.getConnections()).toHaveLength(1);
        });

        test("Group 10f - Copy whole group", () => {
            const copy = CopyGroup([objs[0], objs[1], objs[2], objs[3], objs[4]]);

            expect(copy.getWires()).toHaveLength(4);
            expect(copy.getComponents()).toHaveLength(5);

            const sCopy = copy.getComponents()[0];
            const n0Copy = copy.getComponents()[1];
            const n1Copy = copy.getComponents()[2];
            const l0Copy = copy.getComponents()[3];
            const l1Copy = copy.getComponents()[4];

            expect(sCopy).toBeInstanceOf(Switch);
            expect(sCopy.getConnections()).toHaveLength(1);
            expect(n0Copy).toBeInstanceOf(DigitalNode);
            expect(n0Copy.getConnections()).toHaveLength(2);
            expect(n1Copy).toBeInstanceOf(DigitalNode);
            expect(n1Copy.getConnections()).toHaveLength(3);
            expect(l0Copy).toBeInstanceOf(LED);
            expect(l0Copy.getConnections()).toHaveLength(1);
            expect(l1Copy).toBeInstanceOf(LED);
            expect(l1Copy.getConnections()).toHaveLength(1);
        });
    });
});

describe("GetInvertedGate", () => {
    test("AND -> NAND", () => {
        expect(GetInvertedGate(new ANDGate()) === "NANDGate").toBeTruthy();
    })
});
