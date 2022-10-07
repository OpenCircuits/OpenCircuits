import {GetHelpers} from "test/helpers/Helpers";

import {SnipGate} from "digital/actions/compositions/SnipGate";

import {DigitalCircuitDesigner} from "digital/models";

import {LED, Switch} from "digital/models/ioobjects";

import {BUFGate, NOTGate} from "digital/models/ioobjects/gates/BUFGate";


describe("SnipGateAction", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect } = GetHelpers(designer);

    describe("BUFGate", () => {
        const [input, buf, out] = Place(new Switch(), new BUFGate(), new LED());
        Connect(input, buf);
        Connect(buf, out);

        const action = SnipGate(buf);

        test("Execute/Undo", () => {
            expect(out.isOn()).toBeFalsy();
            input.activate(true);
            expect(out.isOn()).toBeTruthy();
            input.activate(false);
            expect(out.isOn()).toBeFalsy();

            const outputs = input.getOutputs();
            expect(outputs).toHaveLength(1);
            expect(outputs[0].getOutput().getParent()).toBe(out);
        });

        test("Undo", () => {
            action.undo();
            expect(out.isOn()).toBeFalsy();
            input.activate(true);
            expect(out.isOn()).toBeTruthy();
            input.activate(false);
            expect(out.isOn()).toBeFalsy();

            const outputs2 = input.getOutputs();
            expect(outputs2).toHaveLength(1);
            expect(outputs2[0].getOutput().getParent()).toBe(buf);
            const outputsBuf = buf.getOutputs();
            expect(outputsBuf).toHaveLength(1);
            expect(outputsBuf[0].getOutput().getParent()).toBe(out);
        });
    });

    describe("NOTGate", () => {
        const [input, not, out] = Place(new Switch(), new NOTGate(), new LED());
        Connect(input, not);
        Connect(not, out);

        const action = SnipGate(not);

        test("Execute/Undo", () => {
            expect(out.isOn()).toBeFalsy();
            input.activate(true);
            expect(out.isOn()).toBeTruthy();
            input.activate(false);
            expect(out.isOn()).toBeFalsy();

            const outputs = input.getOutputs();
            expect(outputs).toHaveLength(1);
            expect(outputs[0].getOutput().getParent()).toBe(out);
        });

        test("Undo", () => {
            action.undo();
            expect(out.isOn()).toBeTruthy();
            input.activate(true);
            expect(out.isOn()).toBeFalsy();
            input.activate(false);
            expect(out.isOn()).toBeTruthy();

            const outputs2 = input.getOutputs();
            expect(outputs2).toHaveLength(1);
            expect(outputs2[0].getOutput().getParent()).toBe(not);
            const outputsBuf = not.getOutputs();
            expect(outputsBuf).toHaveLength(1);
            expect(outputsBuf[0].getOutput().getParent()).toBe(out);
        });
    });

    test("Unconnected Gate", () => {
        designer.reset();
        const [buf] = Place(new BUFGate());

        const action = SnipGate(buf);

        expect(designer.getObjects().some((comp) => (comp instanceof BUFGate))).toBeFalsy();
        expect(buf.getDesigner()).toBeUndefined();

        action.undo();

        expect(designer.getObjects().some((comp) => (comp instanceof BUFGate))).toBeTruthy();
        expect(buf.getDesigner()).toBeDefined();
    });

    test("Unplaced Gate", () => {
        const buf = new BUFGate();

        expect(() => SnipGate(buf)).toThrow();
    })
})
