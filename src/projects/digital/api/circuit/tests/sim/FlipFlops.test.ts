import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/schema/Signal";
import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Flip Flops", () => {
    const ON = Signal.On, OFF = Signal.Off;

    describe("DFlipFlop", () => {
        const [_, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
        const [_d,
            { pre: [PRE], clr: [CLR], D: [D], clk: [CLK], Q: [Q], Qinv: [Q2] },
        ] = PlaceAndConnect("DFlipFlop");

        function expectState(signal: Signal): void {
            expect(Q.inputs[0].signal).toBe(signal);
            expect(Q2.inputs[0].signal).toBe(Signal.invert(signal));
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Toggle the Data without the Clock", () => {
            TurnOn(D);
            expectState(OFF);
            TurnOff(D);
            expectState(OFF);
        });
        test("Clock on and off w/o data on", () => {
            TurnOn(CLK);
            expectState(OFF);
            TurnOff(CLK);
            expectState(OFF);
        });
        test("Flip Flop to On", () => {
            TurnOn(D);
            TurnOn(CLK);

            expectState(ON);

            TurnOff(CLK);

            expectState(ON);
        });
        test("Flip Flop to Off", () => {
            TurnOff(D);
            TurnOn(CLK);

            expectState(OFF);

            TurnOff(CLK);

            expectState(OFF);
        });
        test("Toggle Data after Clock", () => {
            // Toggling on
            TurnOn(CLK);
            TurnOn(D);

            expectState(OFF);

            TurnOff(CLK);

            expectState(OFF);

            // Set on
            TurnOn(D);
            TurnOn(CLK);
            expectState(ON);
            TurnOff(CLK);

            // Toggling off
            TurnOn(CLK);
            TurnOff(D);

            expectState(ON);

            TurnOff(CLK);

            expectState(ON);
        });
        test("PRE and CLR", () => {
            TurnOn(PRE);
            expectState(ON);
            TurnOff(PRE);
            expectState(ON);

            TurnOn(CLR);
            expectState(OFF);
            TurnOff(CLR);
            expectState(OFF);
        });
    });

    describe("JKFlipFlop", () => {
        const [_, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
        const [_jk,
            { pre: [PRE], clr: [CLR], J: [J], K: [K], clk: [CLK], Q: [Q], Qinv: [Q2] },
        ] = PlaceAndConnect("JKFlipFlop");

        function expectState(signal: Signal): void {
            expect(Q.inputs[0].signal).toBe(signal);
            expect(Q2.inputs[0].signal).toBe(Signal.invert(signal));
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Turn On an Input", () => {
            TurnOff(CLK);
            TurnOn(J);
            TurnOff(J);

            expectState(OFF);
        });
        test("Set", () => {
            TurnOn(J);
            TurnOn(CLK);
            TurnOff(J);
            TurnOff(CLK);

            expectState(ON);
        });
        test("Set while On, Reset falling edge", () => {
            TurnOn(J);
            TurnOn(CLK);
            TurnOff(J);
            TurnOn(K);
            TurnOff(CLK);

            expectState(ON);
        });
        test("Reset", () => {
            TurnOn(CLK);
            TurnOff(K);
            TurnOff(CLK);

            expectState(OFF);
        });
        test("Reset while Off, Set falling edge", () => {
            TurnOn(K);
            TurnOn(CLK);
            TurnOff(K);
            TurnOn(J);
            TurnOff(CLK);

            expectState(OFF);
        });
        test("Set and Reset", () => {
            TurnOn(J);
            TurnOn(K);

            TurnOn(CLK);
            TurnOff(CLK);

            expectState(ON);

            TurnOn(CLK);
            TurnOff(CLK);

            expectState(OFF);
        });
        test("PRE and CLR", () => {
            TurnOn(PRE);
            expectState(ON);
            TurnOff(PRE);
            expectState(ON);

            TurnOn(CLR);
            expectState(OFF);
            TurnOff(CLR);
            expectState(OFF);
        });
    });

    describe("SRFlipFlop", () => {
        const [_, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
        const [_sr,
            { pre: [PRE], clr: [CLR], S: [S], R: [R], clk: [CLK], Q: [Q], Qinv: [Q2] },
        ] = PlaceAndConnect("SRFlipFlop");

        function expectState(signal: Signal): void {
            expect(Q.inputs[0].signal).toBe(signal);
            expect(Q2.inputs[0].signal).toBe(Signal.invert(signal));
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Turn On an Input", () => {
            TurnOff(CLK);
            TurnOn(S);
            TurnOff(S);

            expectState(OFF);
        });
        test("Set", () => {
            TurnOn(S);
            TurnOn(CLK);
            TurnOff(S);
            TurnOff(CLK);

            expectState(ON);
        });
        test("Set while On, Reset falling edge", () => {
            TurnOn(S);
            TurnOn(CLK);
            TurnOff(S);
            TurnOn(R);
            TurnOff(CLK);

            expectState(ON);
        });
        test("Reset", () => {
            TurnOn(CLK);
            TurnOff(R);
            TurnOff(CLK);

            expectState(OFF);
        });
        test("Reset while Off, Set falling edge", () => {
            TurnOn(R);
            TurnOn(CLK);
            TurnOff(R);
            TurnOn(S);
            TurnOff(CLK);

            expectState(OFF);
        });
        test("Set and Reset, undefined behavior", () => {
            TurnOn(R);
            TurnOn(S)

            TurnOn(CLK);
            TurnOff(CLK);

            expect.anything();
        });
        test("PRE and CLR", () => {
            TurnOn(PRE);
            expectState(ON);
            TurnOff(PRE);
            expectState(ON);

            TurnOn(CLR);
            expectState(OFF);
            TurnOff(CLR);
            expectState(OFF);
        });
    });

    describe("TFlipFlop", () => {
        const [_, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
        const [_t,
            { pre: [PRE], clr: [CLR], T: [T], clk: [CLK], Q: [Q], Qinv: [Q2] },
        ] = PlaceAndConnect("TFlipFlop");

        function expectState(signal: Signal): void {
            expect(Q.inputs[0].signal).toBe(signal);
            expect(Q2.inputs[0].signal).toBe(Signal.invert(signal));
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Toggle the Data without the Clock", () => {
            TurnOff(T);
            expectState(OFF);
            TurnOff(T)
            expectState(OFF);
        });
        test("Clock on and off w/o data on", () => {
            TurnOff(CLK);
            expectState(OFF);
            TurnOff(CLK);
            expectState(OFF);
        });
        test("Flip Flop Toggle", () => {
            TurnOn(T);

            TurnOn(CLK);
            expectState(ON);

            TurnOff(CLK);
            expectState(ON);

            TurnOn(CLK);
            expectState(OFF);
        });
        test("PRE and CLR", () => {
            TurnOn(PRE);
            expectState(ON);
            TurnOff(PRE);
            expectState(ON);

            TurnOn(CLR);
            expectState(OFF);
            TurnOff(CLR);
            expectState(OFF);
        });
    });

    // TODO: More tests, especially involving metastability
});
