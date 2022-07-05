import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {TFlipFlop} from "digital/models/ioobjects/flipflops/TFlipFlop";



describe("TFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const { AutoPlace } = GetHelpers(designer);

    const [, [PRE, CLR, T, C], [Q, Q2]] = AutoPlace(new TFlipFlop());

    function expectState(state: boolean): void {
        expect(Q.isOn()).toBe(state);
        expect(Q2.isOn()).toBe(!state);
    }

    test("Initial State", () => {
        expectState(OFF);
    });
    test("Toggle the Data without the Clock", () => {
        T.activate(ON);
        expectState(OFF);
        T.activate(OFF)
        expectState(OFF);
    });
    test("Clock on and off w/o data on", () => {
        C.activate(ON);
        expectState(OFF);
        C.activate(OFF);
        expectState(OFF);
    });
    test("Flip Flop Toggle", () => {
        T.activate(ON);

        C.activate(ON);
        expectState(ON);

        C.activate(OFF);
        expectState(ON);

        C.activate(ON);
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
