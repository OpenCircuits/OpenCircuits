import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DLatch} from "digital/models/ioobjects/latches/DLatch";

import {GetHelpers} from "test/helpers/Helpers";


describe("DLatch", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const {AutoPlace} = GetHelpers(designer);

    const [f, [D, E], [Q, Q2]] = AutoPlace(new DLatch());

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
