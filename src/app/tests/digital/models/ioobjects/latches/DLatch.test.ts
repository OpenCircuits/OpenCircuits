import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}                 from "digital/models/ioobjects/inputs/Switch";
import {DLatch}                 from "digital/models/ioobjects/latches/DLatch";
import {LED}                    from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";


describe("DLatch", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect} = GetHelpers({designer});
    const E = new Switch(), D = new Switch(), l = new DLatch(), Q = new LED(), Q2 = new LED();

    Place(E, D, l, Q, Q2);
    Connect(E, 0, l, DLatch.E_PORT);
    Connect(D, 0, l, DLatch.DATA_PORT);
    Connect(l, DLatch.Q_PORT, Q, 0);
    Connect(l, DLatch.Q2_PORT, Q2, 0);

    function expectState(state: boolean): void {
        expect(Q.isOn()).toBe(state);
        expect(Q2.isOn()).toBe(!state);
    }

    test("Initial State", () => {
        expectState(OFF);
    });
    test("Toggle the Data without being enabled", () => {
        E.activate(OFF);
        D.activate(ON);

        expectState(OFF);

        D.activate(OFF);

        expectState(OFF);
    });
    test("Latch Off", () => {
        E.activate(ON);

        expectState(OFF);

        D.activate(ON);

        expectState(ON);

        D.activate(OFF);

        expectState(OFF);
    });
    test("Latch in False State", () => {
        E.activate(OFF);

        expectState(OFF);

        D.activate(ON);

        expectState(OFF);
    });
    test("Latch in True State", () => {
        E.activate(ON);

        expectState(ON);

        E.activate(OFF);

        expectState(ON);

        D.activate(OFF);

        expectState(ON);
    });
});
