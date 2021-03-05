import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}                 from "digital/models/ioobjects/inputs/Switch";
import {TFlipFlop}              from "digital/models/ioobjects/flipflops/TFlipFlop";
import {LED}                    from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";


describe("TFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect} = GetHelpers({designer});
    const C = new Switch(), T = new Switch(), PRE = new Switch(), CLR = new Switch();
    const f = new TFlipFlop(), Q = new LED(), Q2 = new LED();

    Place(C, T, PRE, CLR, f, Q, Q2);
    Connect(C,  0, f, TFlipFlop.CLK_PORT);
    Connect(T, 0, f, TFlipFlop.TGL_PORT);
    Connect(PRE, 0, f, TFlipFlop.PRE_PORT);
    Connect(CLR, 0, f, TFlipFlop.CLR_PORT);
    Connect(f, TFlipFlop.Q_PORT,  Q, 0);
    Connect(f, TFlipFlop.Q2_PORT, Q2, 0);

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
