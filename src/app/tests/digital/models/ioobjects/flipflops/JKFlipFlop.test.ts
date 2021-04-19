import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {JKFlipFlop}      from "digital/models/ioobjects/flipflops/JKFlipFlop";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";


describe("JKFlipFlop", () => {
    const ON = true, OFF = false;

    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect} = GetHelpers({designer});
    const C = new Switch(), J = new Switch(), K = new Switch(), PRE = new Switch();
    const f = new JKFlipFlop(), CLR = new Switch(), Q = new LED(), Q2 = new LED();

    Place(C, J, K, PRE, CLR, f, Q, Q2);
    Connect(C,  0, f, JKFlipFlop.CLK_PORT);
    Connect(J, 0, f, JKFlipFlop.SET_PORT);
    Connect(K, 0, f, JKFlipFlop.RST_PORT);
    Connect(PRE, 0, f, JKFlipFlop.PRE_PORT);
    Connect(CLR, 0, f, JKFlipFlop.CLR_PORT);
    Connect(f, JKFlipFlop.Q_PORT,  Q, 0);
    Connect(f, JKFlipFlop.Q2_PORT, Q2, 0);

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
