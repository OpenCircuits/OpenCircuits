import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}                 from "digital/models/ioobjects/inputs/Switch";
import {DFlipFlop}              from "digital/models/ioobjects/flipflops/DFlipFlop";
import {LED}                    from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("DFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const C = new Switch(), D = new Switch(), PRE = new Switch(), CLR = new Switch();
    const f = new DFlipFlop(), Q = new LED(), Q2 = new LED();

    Place(designer, [C, D, PRE, CLR, f, Q, Q2]);
    Connect(C,  0, f, DFlipFlop.CLK_PORT);
    Connect(D, 0, f, DFlipFlop.DATA_PORT);
    Connect(PRE, 0, f, DFlipFlop.PRE_PORT);
    Connect(CLR, 0, f, DFlipFlop.CLR_PORT);
    Connect(f, DFlipFlop.Q_PORT,  Q, 0);
    Connect(f, DFlipFlop.Q2_PORT, Q2, 0);

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
