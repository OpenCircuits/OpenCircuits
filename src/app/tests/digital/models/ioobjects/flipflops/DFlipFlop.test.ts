import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {DFlipFlop} from "digital/models/ioobjects/flipflops/DFlipFlop";



describe("DFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const { AutoPlace } = GetHelpers(designer);

    const [, [PRE, CLR, D, C], [Q, Q2]] = AutoPlace(new DFlipFlop());

    function expectState(state: boolean): void {
        expect(Q.isOn()).toBe(state);
        expect(Q2.isOn()).toBe(!state);
    }

    test("Initial State", () => {
        expectState(OFF);
    });
    test("Toggle the Data without the Clock", () => {
        D.activate(ON);
        expectState(OFF);
        D.activate(OFF)
        expectState(OFF);
    });
    test("Clock on and off w/o data on", () => {
        C.activate(ON);
        expectState(OFF);
        C.activate(OFF);
        expectState(OFF);
    });
    test("Flip Flop to On", () => {
        D.activate(ON);
        C.activate(ON);

        expectState(ON);

        C.activate(OFF);

        expectState(ON);
    });
    test("Flip Flop to Off", () => {
        D.activate(OFF);
        C.activate(ON);

        expectState(OFF);

        C.activate(false);

        expectState(OFF);
    });
    test("Toggle Data after Clock", () => {
        // Toggling on
        C.activate(ON);
        D.activate(ON);

        expectState(OFF);

        C.activate(OFF);

        expectState(OFF);


        // Set on
        D.activate(ON);
        C.activate(ON);
        expectState(ON);
        C.activate(OFF);


        // Toggling off
        C.activate(ON);
        D.activate(OFF);

        expectState(ON);

        C.activate(OFF);

        expectState(ON);
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
