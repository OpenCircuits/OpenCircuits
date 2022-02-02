import "jest";

import {DigitalCircuitDesigner} from "digital/models";
import {LED, Switch} from "digital/models/ioobjects";
import {BUFGate, NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {CreateSnipGateAction} from "digital/actions/SnipGateActionFactory";

import {GetHelpers} from "test/helpers/Helpers";


describe("SnipGateAction", () => {
    const designer = new DigitalCircuitDesigner(0);
    const {Place, Connect} = GetHelpers(designer);

    describe("BUFGate", () => {
        const [input, buf, out] = Place(new Switch(), new BUFGate(), new LED());
        Connect(input, 0, buf, 0);
        Connect(buf, 0, out, 0);

        const action = CreateSnipGateAction(buf);

        test("Execute/Undo", () => {
            expect(out.isOn()).toBeFalsy();
            input.activate(true);
            expect(out.isOn()).toBeTruthy();
            input.activate(false);
            expect(out.isOn()).toBeFalsy();

            const outputs = input.getOutputs();
            expect(outputs.length).toBe(1);
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
            expect(outputs2.length).toBe(1);
            expect(outputs2[0].getOutput().getParent()).toBe(buf);
            const outputsBuf = buf.getOutputs();
            expect(outputsBuf.length).toBe(1);
            expect(outputsBuf[0].getOutput().getParent()).toBe(out);
        });
    });

    describe("NOTGate", () => {
        const [input, not, out] = Place(new Switch(), new NOTGate(), new LED());
        Connect(input, 0, not, 0);
        Connect(not, 0, out, 0);

        const action = CreateSnipGateAction(not);

        test("Execute/Undo", () => {
            expect(out.isOn()).toBeFalsy();
            input.activate(true);
            expect(out.isOn()).toBeTruthy();
            input.activate(false);
            expect(out.isOn()).toBeFalsy();

            const outputs = input.getOutputs();
            expect(outputs.length).toBe(1);
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
            expect(outputs2.length).toBe(1);
            expect(outputs2[0].getOutput().getParent()).toBe(not);
            const outputsBuf = not.getOutputs();
            expect(outputsBuf.length).toBe(1);
            expect(outputsBuf[0].getOutput().getParent()).toBe(out);
        });
    });
})