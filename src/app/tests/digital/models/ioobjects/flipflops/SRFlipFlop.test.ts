import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {SRFlipFlop} from "digital/models/ioobjects/flipflops/SRFlipFlop";



describe("SRFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const { AutoPlace } = GetHelpers(designer);

    const [, [PRE, CLR, S, C, R], [Q, Q2]] = AutoPlace(new SRFlipFlop());

    function expectState(state: boolean): void {
        expect(Q.isOn()).toBe(state);
        expect(Q2.isOn()).toBe(!state);
    }

    test("Initial State", () => {
        expectState(OFF);
    });
    test("Turn On an Input", () => {
        C.activate(OFF);
        S.activate(ON);
        S.activate(OFF);

        expectState(OFF);
    });
    test("Set", () => {
        S.activate(ON);
        C.activate(ON);
        S.activate(OFF);
        C.activate(OFF);

        expectState(ON);
    });
    test("Set while On, Reset falling edge", () => {
        S.activate(ON);
        C.activate(ON);
        S.activate(OFF);
        R.activate(ON);
        C.activate(OFF);

        expectState(ON);
    });
    test("Reset", () => {
        C.activate(ON);
        R.activate(OFF);
        C.activate(OFF);

        expectState(OFF);
    });
    test("Reset while Off, Set falling edge", () => {
        R.activate(ON);
        C.activate(ON);
        R.activate(OFF);
        S.activate(ON);
        C.activate(OFF);

        expectState(OFF);
    });
    test("Set and Reset, undefined behavior", () => {
        R.activate(ON);
        S.activate(ON)

        C.activate(ON);
        C.activate(OFF);

        expect.anything();
    });
    test("PRE and CLR", () => {
        PRE.activate(ON);
        expectState(ON);
        PRE.activate(OFF);
        expectState(ON);

        CLR.activate(ON);
        expectState(OFF);
        CLR.activate(OFF);
        expectState(OFF);
    });
});
