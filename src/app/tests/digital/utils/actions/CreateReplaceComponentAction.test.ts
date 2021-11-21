import "jest";

import {CreateReplaceDigitalComponentAction} from "digital/actions/ReplaceDigitalComponentActionFactory";

import {DigitalCircuitDesigner} from "digital/models";
import {ANDGate, LED, Multiplexer, ORGate, SRLatch, Switch, XORGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";

import {GetHelpers} from "test/helpers/Helpers";
import {MuxPortChangeAction} from "digital/actions/ports/MuxPortChangeAction";


describe("CreateReplaceDigitalComponentAction", () => {
    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect} = GetHelpers({designer});

    test("ANDGate -> ORGate", () => {
        const [a, b, and, out] = Place(new Switch(), new Switch(), new ANDGate(), new LED());
        const or = new ORGate();

        Connect(a, 0, and, 0);
        Connect(b, 0, and, 1);
        Connect(and, 0, out, 0);

        // Initial
        expect(out.isOn()).toBeFalsy();
        a.activate(true);
        expect(out.isOn()).toBeFalsy();
        b.activate(true);
        expect(out.isOn()).toBeTruthy();
        a.activate(false);
        expect(out.isOn()).toBeFalsy();
        b.activate(false);
        expect(out.isOn()).toBeFalsy();

        // Replaced
        const action = CreateReplaceDigitalComponentAction(designer, and, or);
        expect(out.isOn()).toBeFalsy();
        a.activate(true);
        expect(out.isOn()).toBeTruthy();
        b.activate(true);
        expect(out.isOn()).toBeTruthy();
        a.activate(false);
        expect(out.isOn()).toBeTruthy();
        b.activate(false);
        expect(out.isOn()).toBeFalsy();

        // Undo
        action.undo();
        expect(out.isOn()).toBeFalsy();
        a.activate(true);
        expect(out.isOn()).toBeFalsy();
        b.activate(true);
        expect(out.isOn()).toBeTruthy();
        a.activate(false);
        expect(out.isOn()).toBeFalsy();
        b.activate(false);
        expect(out.isOn()).toBeFalsy();
    });

    test("ANDGate -> Switch", () => {
        const [and, out1, out2] = Place(new ANDGate(), new LED(), new LED());
        const a = new Switch();

        Connect(a, 0, out1, 0);
        Connect(a, 0, out2, 0);

        // Initial
        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();
        
        // Replaced
        const action = CreateReplaceDigitalComponentAction(designer, and, a);
        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();
        a.activate(true);
        expect(out1.isOn()).toBeTruthy();
        expect(out2.isOn()).toBeTruthy();
        a.activate(false);
        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();
    });

    test("XORGate -> NOTGate", () => {
        const [a, xor, out] = Place(new Switch(), new XORGate(), new LED());
        const not = new NOTGate();

        Connect(a, 0, xor, 1);
        Connect(xor, 0, out, 0);

        // Initial
        expect(out.isOn()).toBeFalsy();
        a.activate(true);
        expect(out.isOn()).toBeTruthy();
        a.activate(false);
        expect(out.isOn()).toBeFalsy();

        // Replaced
        const action = CreateReplaceDigitalComponentAction(designer, xor, not);
        expect(out.isOn()).toBeTruthy();
        a.activate(true);
        expect(out.isOn()).toBeFalsy();
        a.activate(false);
        expect(out.isOn()).toBeTruthy();
    });

    test("Switch -> XORGate", () => {
        const [a, b, c, out1, out2] = Place(new Switch(), new Switch(), new Switch(), new LED(), new LED());
        const xor = new XORGate();
        Connect(a, 0, out1, 0);
        Connect(a, 0, out2, 0);

        // Initial
        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();
        a.activate(true);
        expect(out1.isOn()).toBeTruthy();
        expect(out2.isOn()).toBeTruthy();
        a.activate(false);
        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();

        // Replaced
        CreateReplaceDigitalComponentAction(designer, a, xor);
        Connect(b, 0, xor, 0);
        Connect(c, 0, xor, 1);

        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();
        b.activate(true);
        expect(out1.isOn()).toBeTruthy();
        expect(out2.isOn()).toBeTruthy();
        c.activate(true);
        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();
        b.activate(false);
        expect(out1.isOn()).toBeTruthy();
        expect(out2.isOn()).toBeTruthy();
        c.activate(false);
        expect(out1.isOn()).toBeFalsy();
        expect(out2.isOn()).toBeFalsy();
    });

    test("Multiplexer -> ANDGate", () => {
        const [mux, in0, in1, in2, in3, in4, in5, out] = Place(new Multiplexer(), new Switch(), new Switch(), new Switch(),
                                                                new Switch(), new Switch(), new Switch(), new LED());
        Connect(in0, 0, mux, 0);
        Connect(in1, 0, mux, 1);
        Connect(in2, 0, mux, 2);
        Connect(in3, 0, mux, 3);
        // Connect(in4, 0, mux, 4);
        // Connect(in5, 0, mux, 5);
        // Connect()
    });

    describe("Invalid", () => {
        test("ANDGate -> Switch", () => {
            const [a, and] = Place(new Switch(), new ANDGate());
            const b = new Switch();
            Connect(a, 0, and, 0);
            expect(() => {CreateReplaceDigitalComponentAction(designer, and, b)}).toThrow();
        });

        test("SRLatch -> ANDGate", () => {
            const [sr, out1, out2] = Place(new SRLatch(), new LED(), new LED());
            const and = new ANDGate();
            Connect(sr, 0, out1, 0);
            Connect(sr, 1, out2, 0);
            expect(() => {CreateReplaceDigitalComponentAction(designer, sr, and)}).toThrow();
        });
    });
});
