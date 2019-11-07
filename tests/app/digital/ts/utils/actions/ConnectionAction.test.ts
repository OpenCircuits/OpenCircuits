import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {Place} from "test/helpers/Helpers";

describe("Connection Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), b = new LED();

        Place(designer, [a]);
        Place(designer, [b]);

        a.activate(true);

        // before connection
        expect(designer.getWires().length).toBe(0);
        expect(a.getOutputs().length).toBe(0);
        expect(b.getInputs().length).toBe(0);
        expect(b.isOn()).toBe(false);

        // connect
        const a1 = new ConnectionAction(a.getOutputPort(0), b.getInputPort(0)).execute();

        // initial
        expect(designer.getWires().length).toBe(1);
        expect(a.getOutputs().length).toBe(1);
        expect(b.getInputs().length).toBe(1);
        expect(b.isOn()).toBe(true);

        // reverted
        a1.undo();
        expect(designer.getWires().length).toBe(0);
        expect(a.getOutputs().length).toBe(0);
        expect(b.getInputs().length).toBe(0);
        expect(b.isOn()).toBe(false);

        // back to initial
        a1.execute();
        expect(designer.getWires().length).toBe(1);
        expect(a.getOutputs().length).toBe(1);
        expect(b.getInputs().length).toBe(1);
        expect(b.isOn()).toBe(true);
    });
});
