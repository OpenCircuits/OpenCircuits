import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Latches", () => {
    describe("DLatch", () => {
        const ON = true, OFF = false;

        const [{}, {}, { Place, TurnOn, TurnOff, Connect }] = CreateTestCircuit();
        const [D, E, Q, Q2, latch] = Place("Switch", "Switch", "LED", "LED", "DLatch");

        Connect(D, latch.ports["D"]);
        Connect(E, latch.ports["E"]);
        Connect(latch.ports["Q"], Q);
        Connect(latch.ports["Qinv"], Q2);

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

        const [{}, {}, { Place, TurnOn, TurnOff, Connect }] = CreateTestCircuit();
        const [S, E, R, Q, Q2, sr] = Place("Switch", "Switch", "Switch", "LED", "LED", "SRLatch");

        Connect(S, sr.ports["S"]);
        Connect(E, sr.ports["E"]);
        Connect(R, sr.ports["R"]);
        Connect(sr.ports["Q"], Q);
        Connect(sr.ports["Qinv"], Q2);

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
