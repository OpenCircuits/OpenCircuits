import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";

describe("Flip Flops", () => {
    describe("DFlipFlop", () => {
        const ON = true, OFF = false;

        const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
        const [PRE, CLR, D, C, Q, Q2, d] = Place("Switch", "Switch", "Switch", "Switch", "LED", "LED", "DFlipFlop");
        PRE.outputs[0].connectTo(d.ports["pre"][0]);
        CLR.outputs[0].connectTo(d.ports["clr"][0]);
        D.outputs[0].connectTo(d.ports["D"][0]);
        C.outputs[0].connectTo(d.ports["clk"][0]);
        d.ports["Q"][0].connectTo(Q.inputs[0]);
        d.ports["Qinv"][0].connectTo(Q2.inputs[0]);

        function expectState(state: boolean): void {
            expect(Q.inputs[0].signal).toBe(state ? Signal.On : Signal.Off);
            expect(Q2.inputs[0].signal).toBe(!state ? Signal.On : Signal.Off);
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
            TurnOn(C);
            expectState(OFF);
            TurnOff(C);
            expectState(OFF);
        });
        test("Flip Flop to On", () => {
            TurnOn(D);
            TurnOn(C);

            expectState(ON);

            TurnOff(C);

            expectState(ON);
        });
        test("Flip Flop to Off", () => {
            TurnOff(D);
            TurnOn(C);

            expectState(OFF);

            TurnOff(C);

            expectState(OFF);
        });
        test("Toggle Data after Clock", () => {
            // Toggling on
            TurnOn(C);
            TurnOn(D);

            expectState(OFF);

            TurnOff(C);

            expectState(OFF);

            // Set on
            TurnOn(D);
            TurnOn(C);
            expectState(ON);
            TurnOff(C);

            // Toggling off
            TurnOn(C);
            TurnOff(D);

            expectState(ON);

            TurnOff(C);

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
        const ON = true, OFF = false;

        const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
        const [PRE, CLR, J, C, K, Q, Q2, jk] = Place("Switch", "Switch", "Switch", "Switch", "Switch", "LED", "LED", "JKFlipFlop");
        PRE.outputs[0].connectTo(jk.ports["pre"][0]);
        CLR.outputs[0].connectTo(jk.ports["clr"][0]);
        J.outputs[0].connectTo(jk.ports["J"][0]);
        K.outputs[0].connectTo(jk.ports["K"][0]);
        C.outputs[0].connectTo(jk.ports["clk"][0]);
        jk.ports["Q"][0].connectTo(Q.inputs[0]);
        jk.ports["Qinv"][0].connectTo(Q2.inputs[0]);

        function expectState(state: boolean): void {
            expect(Q.inputs[0].signal).toBe(state ? Signal.On : Signal.Off);
            expect(Q2.inputs[0].signal).toBe(!state ? Signal.On : Signal.Off);
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Turn On an Input", () => {
            TurnOff(C);
            TurnOn(J);
            TurnOff(J);

            expectState(OFF);
        });
        test("Set", () => {
            TurnOn(J);
            TurnOn(C);
            TurnOff(J);
            TurnOff(C);

            expectState(ON);
        });
        test("Set while On, Reset falling edge", () => {
            TurnOn(J);
            TurnOn(C);
            TurnOff(J);
            TurnOn(K);
            TurnOff(C);

            expectState(ON);
        });
        test("Reset", () => {
            TurnOn(C);
            TurnOff(K);
            TurnOff(C);

            expectState(OFF);
        });
        test("Reset while Off, Set falling edge", () => {
            TurnOn(K);
            TurnOn(C);
            TurnOff(K);
            TurnOn(J);
            TurnOff(C);

            expectState(OFF);
        });
        test("Set and Reset", () => {
            TurnOn(J);
            TurnOn(K);

            TurnOn(C);
            TurnOff(C);

            expectState(ON);

            TurnOn(C);
            TurnOff(C);

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
        const ON = true, OFF = false;

        const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
        const [PRE, CLR, S, C, R, Q, Q2, sr] = Place("Switch", "Switch", "Switch", "Switch", "Switch", "LED", "LED", "SRFlipFlop");
        PRE.outputs[0].connectTo(sr.ports["pre"][0]);
        CLR.outputs[0].connectTo(sr.ports["clr"][0]);
        S.outputs[0].connectTo(sr.ports["S"][0]);
        R.outputs[0].connectTo(sr.ports["R"][0]);
        C.outputs[0].connectTo(sr.ports["clk"][0]);
        sr.ports["Q"][0].connectTo(Q.inputs[0]);
        sr.ports["Qinv"][0].connectTo(Q2.inputs[0]);

        function expectState(state: boolean): void {
            expect(Q.inputs[0].signal).toBe(state ? Signal.On : Signal.Off);
            expect(Q2.inputs[0].signal).toBe(!state ? Signal.On : Signal.Off);
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Turn On an Input", () => {
            TurnOff(C);
            TurnOn(S);
            TurnOff(S);

            expectState(OFF);
        });
        test("Set", () => {
            TurnOn(S);
            TurnOn(C);
            TurnOff(S);
            TurnOff(C);

            expectState(ON);
        });
        test("Set while On, Reset falling edge", () => {
            TurnOn(S);
            TurnOn(C);
            TurnOff(S);
            TurnOn(R);
            TurnOff(C);

            expectState(ON);
        });
        test("Reset", () => {
            TurnOn(C);
            TurnOff(R);
            TurnOff(C);

            expectState(OFF);
        });
        test("Reset while Off, Set falling edge", () => {
            TurnOn(R);
            TurnOn(C);
            TurnOff(R);
            TurnOn(S);
            TurnOff(C);

            expectState(OFF);
        });
        test("Set and Reset, undefined behavior", () => {
            TurnOn(R);
            TurnOn(S)

            TurnOn(C);
            TurnOff(C);

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
        const ON = true, OFF = false;

        const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
        const [PRE, CLR, T, C, Q, Q2, t] = Place("Switch", "Switch", "Switch", "Switch", "LED", "LED", "TFlipFlop");
        PRE.outputs[0].connectTo(t.ports["pre"][0]);
        CLR.outputs[0].connectTo(t.ports["clr"][0]);
        T.outputs[0].connectTo(t.ports["T"][0]);
        C.outputs[0].connectTo(t.ports["clk"][0]);
        t.ports["Q"][0].connectTo(Q.inputs[0]);
        t.ports["Qinv"][0].connectTo(Q2.inputs[0]);

        function expectState(state: boolean): void {
            expect(Q.inputs[0].signal).toBe(state ? Signal.On : Signal.Off);
            expect(Q2.inputs[0].signal).toBe(!state ? Signal.On : Signal.Off);
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
            TurnOff(C);
            expectState(OFF);
            TurnOff(C);
            expectState(OFF);
        });
        test("Flip Flop Toggle", () => {
            TurnOff(T);

            TurnOff(C);
            expectState(ON);

            TurnOff(C);
            expectState(ON);

            TurnOff(C);
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
