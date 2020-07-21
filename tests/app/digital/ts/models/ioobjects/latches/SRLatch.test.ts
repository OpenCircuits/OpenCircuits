import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {SRLatch}         from "digital/models/ioobjects/latches/SRLatch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("SRLatch", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const E = new Switch(), S = new Switch(), R = new Switch();
    const l = new SRLatch(), Q = new LED(), Q2 = new LED();

    Place(designer, [E, S, R, l, Q, Q2]);
    Connect(E, 0, l, SRLatch.E_PORT);
    Connect(S, 0, l, SRLatch.SET_PORT);
    Connect(R, 0, l, SRLatch.RST_PORT);
    Connect(l, SRLatch.Q_PORT, Q, 0);
    Connect(l, SRLatch.Q2_PORT, Q2, 0);

    function expectState(state: boolean): void {
        expect(Q.isOn()).toBe(state);
        expect(Q2.isOn()).toBe(!state);
    }

    test("Initial State", () => {
        expectState(OFF);
    });
    test("Toggle the Data without being enabled", () => {
        E.activate(OFF);
        S.activate(ON);

        expectState(OFF);

        S.activate(OFF);

        expectState(OFF);
    });
    test("Latch Off", () => {
        E.activate(ON);
        S.activate(ON);
        S.activate(OFF);

        expectState(ON);

        R.activate(ON);
        R.activate(OFF);

        expectState(OFF);
    });
    test("Latch in False State", () => {
        E.activate(OFF);

        expectState(OFF);

        S.activate(ON);
        S.activate(OFF);

        expectState(OFF);

        R.activate(ON);
        R.activate(OFF);

        expectState(OFF);
    });
    test("Latch in True State", () => {
        E.activate(ON);

        expectState(OFF);

        S.activate(ON);
        S.activate(OFF);
        E.activate(OFF);

        expectState(ON);

        S.activate(ON);
        S.activate(OFF);

        expectState(ON);

        R.activate(ON);

        expectState(ON);
    });
    test("Set and Reset, undefined behavior", () => {
        E.activate(ON);
        S.activate(ON);
        E.activate(OFF);

        expect.anything();
    });
});
