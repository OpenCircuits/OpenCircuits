import "shared/tests/helpers/Extensions";

import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {CreateTestCircuit} from "tests/helpers/CreateTestCircuit";


describe("Latches", () => {
    const ON = Signal.On, OFF = Signal.Off;

    describe("DLatch", () => {
        const [{}, {}, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
        const [_, { D: [D], E: [E], Q: [Q], Qinv: [Q2] }] = PlaceAndConnect("DLatch");

        function expectState(signal: Signal): void {
            expect(Q.inputs[0].signal).toBe(signal);
            expect(Q2.inputs[0].signal).toBe(Signal.invert(signal));
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
        const [{}, {}, { TurnOn, TurnOff, PlaceAndConnect }] = CreateTestCircuit();
        const [_, { S: [S], R: [R], E: [E], Q: [Q], Qinv: [Q2] }] = PlaceAndConnect("SRLatch");

        function expectState(signal: Signal): void {
            expect(Q.inputs[0].signal).toBe(signal);
            expect(Q2.inputs[0].signal).toBe(Signal.invert(signal));
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
