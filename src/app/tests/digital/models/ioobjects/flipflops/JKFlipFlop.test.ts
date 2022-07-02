import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {JKFlipFlop} from "digital/models/ioobjects/flipflops/JKFlipFlop";



describe("JKFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const { AutoPlace } = GetHelpers(designer);

    const [, [PRE, CLR, J, C, K], [Q, Q2]] = AutoPlace(new JKFlipFlop());

    function expectState(state: boolean): void {
        expect(Q.isOn()).toBe(state);
        expect(Q2.isOn()).toBe(!state);
    }

    test("Initial State", () => {
        expectState(OFF);
    });
    test("Turn On an Input", () => {
        C.activate(OFF);
        J.activate(ON);
        J.activate(OFF);

        expectState(OFF);
    });
    test("Set", () => {
        J.activate(ON);
        C.activate(ON);
        J.activate(OFF);
        C.activate(OFF);

        expectState(ON);
    });
    test("Set while On, Reset falling edge", () => {
        J.activate(ON);
        C.activate(ON);
        J.activate(OFF);
        K.activate(ON);
        C.activate(OFF);

        expectState(ON);
    });
    test("Reset", () => {
        C.activate(ON);
        K.activate(OFF);
        C.activate(OFF);

        expectState(OFF);
    });
    test("Reset while Off, Set falling edge", () => {
        K.activate(ON);
        C.activate(ON);
        K.activate(OFF);
        J.activate(ON);
        C.activate(OFF);

        expectState(OFF);
    });
    test("Set and Reset", () => {
        J.activate(ON);
        K.activate(ON);

        C.activate(ON);
        C.activate(OFF);

        expectState(ON);

        C.activate(ON);
        C.activate(OFF);

        expectState(OFF);
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
