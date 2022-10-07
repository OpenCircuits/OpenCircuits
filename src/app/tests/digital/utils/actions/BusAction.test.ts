/* eslint-disable space-in-parens */
import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {GetHelpers} from "test/helpers/Helpers";

import {Bus, GetComponentBusPorts} from "digital/actions/compositions/Bus";

import {DigitalCircuitDesigner, InputPort, OutputPort} from "digital/models";

import {ANDGate, BCDDisplay, BUFGate, ConstantNumber,
        IC, ICData, LED, Multiplexer, Switch} from "digital/models/ioobjects";


describe("Bus Action", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place } = GetHelpers(designer);

    function expectBusConnections(outs: OutputPort[], ins: InputPort[]) {
        // Helper functions to for expected connectivity
        const expectAllDisconnected = () => {
            expect(designer.getWires()).toHaveLength(0);
        }
        const expectConnected = () => {
            expect(designer.getWires()).toHaveLength(outs.length); // outs.length = ins.length

            // Make sure all ports have exactly 1 connection
            [...ins, ...outs].forEach((p) => {
                expect(p.getWires()).toHaveLength(1);
            });
        }

        // Initial state
        expectAllDisconnected();

        // Bus
        const a1 = Bus(outs, ins);
        expectConnected();

        // Reverted
        a1.undo();
        expectAllDisconnected();

        // Back to bus'd
        a1.execute();
        expectConnected();
    }


    afterEach(() => {
        designer.reset();
    });

    test("Simple 1-port connection", () => {
        const [i1, o1] = Place(new Switch(), new LED());

        i1.setPos(V(-2, 0));
        o1.setPos(V(2, 0));

        expectBusConnections([i1.getOutputPort(0)], [o1.getInputPort(0)]);
    });
    test("Simple 2-port connection", () => {
        const [i1, i2, g1] = Place(new Switch(), new Switch(), new ANDGate());

        i1.setPos(V(-2,  1));
        i2.setPos(V(-2, -1));
        g1.setPos(V( 2,  0));

        expectBusConnections([i1.getOutputPort(0), i2.getOutputPort(0)], g1.getInputPorts());

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(g1.getConnections()[0]);
        expect(i2.getConnections()[0]).toBe(g1.getConnections()[1]);
    });
    test("Basic Constant Number -> BCD 4-port", () => {
        const [i1, o1] = Place(new ConstantNumber(), new BCDDisplay());

        i1.setPos(V(-2, 0));
        o1.setPos(V( 2, 0));

        expectBusConnections(i1.getOutputPorts(), o1.getInputPorts());

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(o1.getConnections()[0]);
        expect(i1.getConnections()[1]).toBe(o1.getConnections()[1]);
        expect(i1.getConnections()[2]).toBe(o1.getConnections()[2]);
        expect(i1.getConnections()[3]).toBe(o1.getConnections()[3]);
    });
    test("Offset Constant Number -> BCD 4-port", () => {
        const [i1, o1] = Place(new ConstantNumber(), new BCDDisplay());

        // From issue #882
        i1.setPos(V(-5, 0.34));
        o1.setPos(V(-0.8, 0.62));

        expectBusConnections(i1.getOutputPorts(), o1.getInputPorts());

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(o1.getConnections()[0]);
        expect(i1.getConnections()[1]).toBe(o1.getConnections()[1]);
        expect(i1.getConnections()[2]).toBe(o1.getConnections()[2]);
        expect(i1.getConnections()[3]).toBe(o1.getConnections()[3]);
    });
    test("Rotated Constant Number -> BCD 4-port", () => {
        const [i1, o1] = Place(new ConstantNumber(), new BCDDisplay());

        // From PR #1020 (https://github.com/OpenCircuits/OpenCircuits/pull/1020#pullrequestreview-914672445)
        i1.setPos(V(-2, 2));
        i1.setAngle(-Math.PI/2);
        o1.setPos(V(2, -2));

        expectBusConnections(i1.getOutputPorts(), o1.getInputPorts());

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(o1.getConnections()[0]);
        expect(i1.getConnections()[1]).toBe(o1.getConnections()[1]);
        expect(i1.getConnections()[2]).toBe(o1.getConnections()[2]);
        expect(i1.getConnections()[3]).toBe(o1.getConnections()[3]);
    });
    test("Multiple Rotated Switches -> BCD 4-port", () => {
        const [i1, i2, i3, i4, o1] = Place(new Switch(), new Switch(), new Switch(), new Switch(), new BCDDisplay());

        i1.setPos(V(-2,  4));
        i2.setPos(V(-2,  2));
        i3.setPos(V(-2, -2));
        i4.setPos(V(-2, -4));

        i1.setAngle( 0.25);
        i2.setAngle(-0.3);
        i3.setAngle( 0.2);
        i4.setAngle(-0.1);

        o1.setPos(V(2, 0));

        expectBusConnections([i1,i2,i3,i4].map((i) => i.getOutputPort(0)), o1.getInputPorts());

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(o1.getConnections()[0]);
        expect(i2.getConnections()[0]).toBe(o1.getConnections()[1]);
        expect(i3.getConnections()[0]).toBe(o1.getConnections()[2]);
        expect(i4.getConnections()[0]).toBe(o1.getConnections()[3]);
    });
    test("Multiple Rotated Switches -> Mux 6-port", () => {
        const [i1, i2, i3, i4, i5, i6, o1] = Place(new Switch(), new Switch(), new Switch(), new Switch(),
                                                   new Switch(), new Switch(), new Multiplexer());

        i1.setPos(V(-2,  6));
        i2.setPos(V(-2,  4));
        i3.setPos(V(-2,  2));
        i4.setPos(V(-2, -2));
        i5.setPos(V(-2, -4));
        i6.setPos(V(-2, -6));

        i1.setAngle(0.25);
        i2.setAngle(-0.3);
        i3.setAngle( 0.2);
        i4.setAngle(-0.1);
        i5.setAngle( 0.3);
        i6.setAngle(-0.17);

        o1.setPos(V(2, 0));
        o1.setAngle(-0.21);

        expectBusConnections([i1,i2,i3,i4,i5,i6].map((i) => i.getOutputPort(0)),
                             [...o1.getInputPorts(), ...o1.getSelectPorts()]);

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(o1.getConnections()[0]);
        expect(i2.getConnections()[0]).toBe(o1.getConnections()[1]);
        expect(i3.getConnections()[0]).toBe(o1.getConnections()[2]);
        expect(i4.getConnections()[0]).toBe(o1.getConnections()[3]);
        expect(i5.getConnections()[0]).toBe(o1.getConnections()[4]); // select 0
        expect(i6.getConnections()[0]).toBe(o1.getConnections()[5]); // select 1
    });
    test("Multiple Rotated Switches + Constant Number -> Mux 6-port", () => {
        const [i1, i2, i3, o1] = Place(new Switch(), new Switch(), new ConstantNumber(), new Multiplexer());

        i1.setPos(V(-2,  4));
        i2.setPos(V(-2,  2));
        i3.setPos(V(-2, -2));

        i1.setAngle(0.25);
        i2.setAngle(-0.3);
        i3.setAngle( 0.2);

        o1.setPos(V(2, 0));
        o1.setAngle(-0.21);

        expectBusConnections([i1,i2,i3].flatMap((i) => i.getOutputPorts()),
                             [...o1.getInputPorts(), ...o1.getSelectPorts()]);

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(o1.getConnections()[0]);
        expect(i2.getConnections()[0]).toBe(o1.getConnections()[1]);
        expect(i3.getConnections()[0]).toBe(o1.getConnections()[2]);
        expect(i3.getConnections()[1]).toBe(o1.getConnections()[3]);
        expect(i3.getConnections()[2]).toBe(o1.getConnections()[4]); // select 0
        expect(i3.getConnections()[3]).toBe(o1.getConnections()[5]); // select 1
    });
    test("Simple IC 4-port", () => {
        /*
         *  [v]-o          ____________
         *             o--[            ]
         *  [v]-o         [            ]
         *             o--[____________]
         *  [v]-o             |     |
         *                    o     o
         *  [v]-o
         */

        const [i1, i2, i3, i4] = Place(new Switch(), new Switch(), new Switch(), new Switch());

        i1.setPos(V(-4,  4));
        i2.setPos(V(-4,  2));
        i3.setPos(V(-4, -2));
        i4.setPos(V(-4, -4));

        // Create IC
        const icdata = ICData.Create([i1,i2,i3,i4]);
        {
            icdata?.setSize(V(4, 2));

            const setPort = (p: number, pos: Vector, dir: Vector) => {
                icdata!.getPorts()[p].setOriginPos(pos);
                icdata!.getPorts()[p].setTargetPos(pos.add(dir.normalize().scale(IO_PORT_LENGTH)));
            }
            setPort(0, V(-2,  1), V(-1,  0));
            setPort(1, V( 1, -1), V( 0, -1));
            setPort(2, V(-2, -1), V(-1,  0));
            setPort(3, V(-1, -1), V( 0, -1));
        }

        const [ic] = Place(new IC(icdata));

        expectBusConnections([i1,i2,i3,i4].flatMap((i) => i.getOutputPorts()), ic.getInputPorts());

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(ic.getConnections()[0]);
        expect(i2.getConnections()[0]).toBe(ic.getConnections()[2]);
        expect(i3.getConnections()[0]).toBe(ic.getConnections()[3]);
        expect(i4.getConnections()[0]).toBe(ic.getConnections()[1]);
    });
    test("Simple IC with Rotated Port 4-port", () => {
        /*
         *  [v]-o          ____________
         *             o--[            ]
         *  [v]-o         [            ]
         *             o--[____________]
         *  [v]-o             |         \
         *                    o          o
         *  [v]-o
         */

        const [i1, i2, i3, i4] = Place(new Switch(), new Switch(), new Switch(), new Switch());

        i1.setPos(V(-4,  4));
        i2.setPos(V(-4,  2));
        i3.setPos(V(-4, -2));
        i4.setPos(V(-4, -4));

        // Create IC
        const icdata = ICData.Create([i1,i2,i3,i4]);
        {
            icdata?.setSize(V(4, 2));

            const setPort = (p: number, pos: Vector, dir: Vector) => {
                icdata!.getPorts()[p].setOriginPos(pos);
                icdata!.getPorts()[p].setTargetPos(pos.add(dir.normalize().scale(IO_PORT_LENGTH)));
            }

            setPort(0, V(-2,  1), V(-1,  0));
            setPort(1, V( 2, -1), V( 1, -1)); // Diagonal
            setPort(2, V(-2, -1), V(-1,  0));
            setPort(3, V(-1, -1), V( 0, -1));
        }

        const [ic] = Place(new IC(icdata));

        expectBusConnections([i1,i2,i3,i4].flatMap((i) => i.getOutputPorts()), ic.getInputPorts());

        // Assert order of connections
        expect(i1.getConnections()[0]).toBe(ic.getConnections()[0]);
        expect(i2.getConnections()[0]).toBe(ic.getConnections()[2]);
        expect(i3.getConnections()[0]).toBe(ic.getConnections()[3]);
        expect(i4.getConnections()[0]).toBe(ic.getConnections()[1]);
    });
    test("Switches at exact same position", () => {
        const [i1, i2, i3, i4, bcd1] = Place(new Switch(), new Switch(), new Switch(),
                                             new Switch(), new BCDDisplay());

        i1.setPos(V(0,0));
        i2.setPos(V(0,0));
        i3.setPos(V(0,0));
        i4.setPos(V(0,0));
        bcd1.setPos(V(4,0));

        // Expect every single switch to connect, but we can't assert anything about the order of connections
        expectBusConnections([i1,i2,i3,i4].flatMap((i) => i.getOutputPorts()), bcd1.getInputPorts());
    });

    describe("Bus Components", () => {
        // Buses that should work
        test("Constant Number -> BCD Display", () => {
            const [c1, bcd1] = Place(new ConstantNumber(), new BCDDisplay());

            const [iports, oports] = GetComponentBusPorts([c1, bcd1]);

            expect(iports).toHaveLength(4);
            expect(oports).toHaveLength(4);

            expectBusConnections(oports, iports);
        });
        test("4 Switches -> BCD Display", () => {
            const [i1, i2, i3, i4, bcd1] = Place(new Switch(), new Switch(), new Switch(),
                                                 new Switch(), new BCDDisplay());

            const [iports, oports] = GetComponentBusPorts([i1, i2, bcd1, i3, i4]);

            expect(iports).toHaveLength(4);
            expect(oports).toHaveLength(4);

            expectBusConnections(oports, iports);
        });
        test("4 Switches -> 2 ANDGates", () => {
            const [i1, i2, i3, i4, a1, a2] = Place(new Switch(), new Switch(), new Switch(),
                                                   new Switch(), new ANDGate(), new ANDGate());

            const [iports, oports] = GetComponentBusPorts([i1, a2, i3, i2, i4, a1]);

            expect(iports).toHaveLength(4);
            expect(oports).toHaveLength(4);

            expectBusConnections(oports, iports);
        });
        test("6 Switches -> Mux", () => {
            const [i1, i2, i3, i4, i5, i6, m1] = Place(new Switch(), new Switch(), new Switch(), new Switch(),
                                                       new Switch(), new Switch(), new Multiplexer());

            const [iports, oports] = GetComponentBusPorts([i1, i2, i3, i4, i5, i6, m1]);

            expect(iports).toHaveLength(6);
            expect(oports).toHaveLength(6);

            expectBusConnections(oports, iports);
        });

        // Buses that should not work
        test("Fail: BUFGate -> BUFGate", () => {
            const [b1, b2] = Place(new BUFGate(), new BUFGate());

            const [iports, oports] = GetComponentBusPorts([b1, b2]);

            expect(iports).not.toHaveLength(oports.length);
        });
        test("Fail: 3 Switches -> BCD Display", () => {
            const [i1, i2, i3, bcd1] = Place(new Switch(), new Switch(), new Switch(), new BCDDisplay());

            const [iports, oports] = GetComponentBusPorts([i1, i2, i3, bcd1]);

            expect(iports).not.toHaveLength(oports.length);
        });
        test("Fail: 7 Switches -> Mux", () => {
            const [i1, i2, i3, i4, i5, i6, i7, m1] = Place(new Switch(), new Switch(), new Switch(), new Switch(),
                                                       new Switch(), new Switch(), new Switch(), new Multiplexer());

            const [iports, oports] = GetComponentBusPorts([i1, i2, i3, i4, i5, i6, i7, m1]);

            expect(iports).not.toHaveLength(oports.length);
        });
    });
});
