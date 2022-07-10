import {GetHelpers} from "test/helpers/Helpers";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {CreateICDataAction}                  from "digital/actions/CreateICDataAction";
import {CreateReplaceDigitalComponentAction} from "digital/actions/ReplaceDigitalComponentActionFactory";

import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {DigitalCircuitDesigner} from "digital/models";

import {ANDGate, Demultiplexer, IC, ICData, LED,
        Multiplexer, ORGate, SRLatch, Switch, XORGate} from "digital/models/ioobjects";

import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";



describe("CreateReplaceDigitalComponentAction", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect } = GetHelpers(designer);

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
        const action = CreateReplaceDigitalComponentAction(and, or);
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
        CreateReplaceDigitalComponentAction(and, a);
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
        CreateReplaceDigitalComponentAction(xor, not);
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
        CreateReplaceDigitalComponentAction(a, xor);
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
        const [mux, in0, in1, in2,
               in3, in4, in5, out] = Place(new Multiplexer(), new Switch(), new Switch(), new Switch(),
                                           new Switch(), new Switch(), new Switch(), new LED());
        const and = new ANDGate();
        new InputPortChangeAction(and, 2, 6).execute();
        Connect(in0, 0, mux, 0);
        Connect(in1, 0, mux, 1);
        Connect(in2, 0, mux, 2);
        Connect(in3, 0, mux, 3);
        const selectPorts = mux.getSelectPorts();
        new ConnectionAction(designer, in4.getOutputPort(0), selectPorts[0]).execute();
        new ConnectionAction(designer, in5.getOutputPort(0), selectPorts[1]).execute();
        Connect(mux, 0, out, 0);

        // Initial
        expect(out.isOn()).toBeFalsy();

        in0.activate(true);
        expect(out.isOn()).toBeTruthy();

        in0.activate(false);
        expect(out.isOn()).toBeFalsy();
        in1.activate(true);
        expect(out.isOn()).toBeFalsy();
        in4.activate(true);
        expect(out.isOn()).toBeTruthy();

        in1.activate(false);
        expect(out.isOn()).toBeFalsy();
        in4.activate(false);
        expect(out.isOn()).toBeFalsy();
        in2.activate(true);
        expect(out.isOn()).toBeFalsy();
        in5.activate(true);
        expect(out.isOn()).toBeTruthy();

        in2.activate(false);
        expect(out.isOn()).toBeFalsy();
        in3.activate(true);
        expect(out.isOn()).toBeFalsy();
        in4.activate(true);
        expect(out.isOn()).toBeTruthy();
        in3.activate(false);
        in4.activate(false);
        in5.activate(false);


        CreateReplaceDigitalComponentAction(mux, and);

        // Modified
        expect(out.isOn()).toBeFalsy();
        in0.activate(true);
        expect(out.isOn()).toBeFalsy();
        in1.activate(true);
        expect(out.isOn()).toBeFalsy();
        in2.activate(true);
        expect(out.isOn()).toBeFalsy();
        in3.activate(true);
        expect(out.isOn()).toBeFalsy();
        in4.activate(true);
        expect(out.isOn()).toBeFalsy();
        in5.activate(true);
        expect(out.isOn()).toBeTruthy();
    });

    test("ANDGate -> Demultiplexer", () => {
        const [in1, in2, in3, and, out] = Place(new Switch(), new Switch(), new Switch(), new ANDGate(), new LED());
        const demux = new Demultiplexer();
        new InputPortChangeAction(and, 2, 3).execute();
        Connect(in1, 0, and, 0);
        Connect(in2, 0, and, 1);
        Connect(in3, 0, and, 2);
        Connect(and, 0, out, 0);

        // Initial
        expect(out.isOn()).toBeFalsy();
        in1.activate(true);
        expect(out.isOn()).toBeFalsy();
        in2.activate(true);
        expect(out.isOn()).toBeFalsy();
        in3.activate(true);
        expect(out.isOn()).toBeTruthy();
        in1.activate(false);
        in2.activate(false);
        in3.activate(false);

        CreateReplaceDigitalComponentAction(and, demux);

        // Replaced
        expect(in1.getOutputs()[0].getOutputComponent()).toBe(demux);
        expect(in2.getOutputs()[0].getOutputComponent()).toBe(demux);
        expect(in3.getOutputs()[0].getOutputComponent()).toBe(demux);
        expect(out.getInputs()[0].getInputComponent()).toBe(demux);
        const demuxInputs = demux.getInputs().map(wire => wire.getInputComponent());
        expect(demuxInputs).toEqual(expect.arrayContaining([in1, in2, in3]));
        expect(demux.getOutputs()[0].getOutputComponent()).toBe(out);
    });

    test("IC -> ANDGate", () => {
        const [a, b, or, out] = Place(new Switch(), new Switch(), new ORGate(), new LED());
        const and = new ANDGate();
        Connect(a, 0, or, 0);
        Connect(b, 0, or, 1);
        Connect(or, 0, out, 0);
        const data = ICData.Create([a, b, or, out])!;
        expect(data).toBeDefined();
        new CreateICDataAction(data, designer).execute();

        const [ic, d, e, outer] = Place(new IC(data), new Switch(), new Switch(), new LED());
        Connect(d, 0, ic, 0);
        Connect(e, 0, ic, 1);
        Connect(ic, 0, outer, 0);

        CreateReplaceDigitalComponentAction(ic, and);
        expect(d.getOutputs()[0].getOutputComponent()).toBe(and);
        expect(e.getOutputs()[0].getOutputComponent()).toBe(and);
        expect(outer.getInputs()[0].getInputComponent()).toBe(and);
        const andInputs = and.getInputs().map(wire => wire.getInputComponent());
        expect(andInputs).toEqual(expect.arrayContaining([d, e]));
        expect(and.getOutputs()[0].getOutputComponent()).toBe(outer);
    });

    describe("Invalid", () => {
        test("ANDGate -> Switch", () => {
            const [a, and] = Place(new Switch(), new ANDGate());
            const b = new Switch();
            Connect(a, 0, and, 0);
            expect(() => {CreateReplaceDigitalComponentAction(and, b)}).toThrow();
        });

        test("SRLatch -> ANDGate", () => {
            const [sr, out1, out2] = Place(new SRLatch(), new LED(), new LED());
            const and = new ANDGate();
            Connect(sr, 0, out1, 0);
            Connect(sr, 1, out2, 0);
            expect(() => {CreateReplaceDigitalComponentAction(sr, and)}).toThrow();
        });
    });
});
