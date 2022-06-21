import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {SRLatch} from "digital/models/ioobjects/latches/SRLatch";



describe("SRLatch", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const { AutoPlace } = GetHelpers(designer);

    const [, [S, E, R], [Q, Q2]] = AutoPlace(new SRLatch());

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
