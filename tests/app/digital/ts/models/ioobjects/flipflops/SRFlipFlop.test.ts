import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {SRFlipFlop}      from "digital/models/ioobjects/flipflops/SRFlipFlop";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {Place, Connect} from "test/helpers/Helpers";

describe("SRFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const C = new Switch(), S = new Switch(), R = new Switch(), PRE = new Switch();
    const f = new SRFlipFlop(), CLR = new Switch(), Q = new LED(), Q2 = new LED();

    Place(designer, [C, S, R, PRE, CLR, f, Q, Q2]);
    Connect(C,  0, f, SRFlipFlop.CLK_PORT);
    Connect(S, 0, f, SRFlipFlop.SET_PORT);
    Connect(R, 0, f, SRFlipFlop.RST_PORT);
    Connect(PRE, 0, f, SRFlipFlop.PRE_PORT);
    Connect(CLR, 0, f, SRFlipFlop.CLR_PORT);
    Connect(f, SRFlipFlop.Q_PORT,  Q, 0);
    Connect(f, SRFlipFlop.Q2_PORT, Q2, 0);

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
