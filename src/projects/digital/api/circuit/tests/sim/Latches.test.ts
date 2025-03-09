import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/utils/Signal";
import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Latches", () => {
    describe("DLatch", () => {
        const ON = true, OFF = false;

        const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
        const [D, E, Q, Q2, d] = Place("Switch", "Switch", "LED", "LED", "DLatch");
        D.outputs[0].connectTo(d.inputs[0]);
        E.outputs[0].connectTo(d.inputs[1]);
        d.outputs[0].connectTo(Q.inputs[0]);
        d.outputs[1].connectTo(Q2.inputs[0]);

        function expectState(state: boolean): void {
            expect(Q.inputs[0].signal).toBe(state ? Signal.On : Signal.Off);
            expect(Q2.inputs[0].signal).toBe(!state ? Signal.On : Signal.Off);
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Toggle the Data without being enabled", () => {
            TurnOff(E);
            TurnOn(D);

            expectState(OFF);

            TurnOff(D);

            expectState(OFF);
        });
        test("Latch Off", () => {
            TurnOn(E);

            expectState(OFF);

            TurnOn(D);

            expectState(ON);

            TurnOff(D);

            expectState(OFF);
        });
        test("Latch in False State", () => {
            TurnOff(E);

            expectState(OFF);

            TurnOn(D);

            expectState(OFF);
        });
        test("Latch in True State", () => {
            TurnOn(E);

            expectState(ON);

            TurnOff(E);

            expectState(ON);

            TurnOff(D);

            expectState(ON);
        });
    });

    describe("SRLatch", () => {
        const ON = true, OFF = false;

        const [{}, {}, { Place, TurnOn, TurnOff }] = CreateTestCircuit();
        const [S, E, R, Q, Q2, sr] = Place("Switch", "Switch", "Switch", "LED", "LED", "SRLatch");
        S.outputs[0].connectTo(sr.inputs[0]);
        E.outputs[0].connectTo(sr.inputs[1]);
        R.outputs[0].connectTo(sr.inputs[2]);
        sr.outputs[0].connectTo(Q.inputs[0]);
        sr.outputs[1].connectTo(Q2.inputs[0]);

        function expectState(state: boolean): void {
            expect(Q.inputs[0].signal).toBe(state ? Signal.On : Signal.Off);
            expect(Q2.inputs[0].signal).toBe(!state ? Signal.On : Signal.Off);
        }

        test("Initial State", () => {
            expectState(OFF);
        });
        test("Toggle the Data without being enabled", () => {
            TurnOff(E);
            TurnOn(S);

            expectState(OFF);

            TurnOff(S);

            expectState(OFF);
        });
        test("Latch Off", () => {
            TurnOn(E);
            TurnOn(S);
            TurnOff(S);

            expectState(ON);

            TurnOn(R);
            TurnOff(R);

            expectState(OFF);
        });
        test("Latch in False State", () => {
            TurnOff(E);

            expectState(OFF);

            TurnOn(S);
            TurnOff(S);

            expectState(OFF);

            TurnOn(R);
            TurnOff(R);

            expectState(OFF);
        });
        test("Latch in True State", () => {
            TurnOn(E);

            expectState(OFF);

            TurnOn(S);
            TurnOff(S);
            TurnOff(E);

            expectState(ON);

            TurnOn(S);
            TurnOff(S);

            expectState(ON);

            TurnOn(R);

            expectState(ON);
        });
        test("Set and Reset, undefined behavior", () => {
            TurnOn(E);
            TurnOn(S);
            TurnOff(E);

            expect.anything();
        });
    });

    // TODO: More tests, especially involving metastability
});
