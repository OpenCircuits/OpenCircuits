import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {BUFGate} from "digital/models/ioobjects/gates/BUFGate";

import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {Place, Connect} from "test/helpers/Helpers";

describe("Input Port Change Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const gate = new ANDGate();

        Place(designer, [gate]);

        // before connection
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);

        // connect
        const a1 = new InputPortChangeAction(gate, 5).execute();

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(5);
        expect(gate.getOutputPortCount().getValue()).toBe(1);

        // reverted
        a1.undo();
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);

        // back to initial
        a1.execute();
        expect(gate.getInputPortCount().getValue()).toBe(5);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
    });
    test("Undo/Redo 2", () => {
        const designer = new DigitalCircuitDesigner(0);
        const gate = new ANDGate();
        const buf1 = new BUFGate();
        const buf2 = new BUFGate();
        const buf3 = new BUFGate();
        const buf4 = new BUFGate();

        Place(designer, [gate, buf1, buf2, buf3, buf4]);
        Connect(buf1, 0, gate, 0);
        Connect(buf2, 0, gate, 1);

        // before change
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(1);
        expect(buf2.getOutputs().length).toBe(1);

        // change input count
        const a1 = new InputPortChangeAction(gate, 4).execute();

        // Connect some more things
        const c1 = Connect(buf3, 0, gate, 2);
        const c2 = Connect(buf4, 0, gate, 3);

        // before change2
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(4);
        expect(buf1.getOutputs().length).toBe(1);
        expect(buf2.getOutputs().length).toBe(1);
        expect(buf3.getOutputs().length).toBe(1);
        expect(buf4.getOutputs().length).toBe(1);

        // change input count
        const a2 = new InputPortChangeAction(gate, 2).execute();

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(1);
        expect(buf2.getOutputs().length).toBe(1);
        expect(buf3.getOutputs().length).toBe(0);
        expect(buf4.getOutputs().length).toBe(0);

        // reverted
        a2.undo();
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(4);
        expect(buf1.getOutputs().length).toBe(1);
        expect(buf2.getOutputs().length).toBe(1);
        expect(buf3.getOutputs().length).toBe(1);
        expect(buf4.getOutputs().length).toBe(1);

        // back to initial
        a2.execute();
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(1);
        expect(buf2.getOutputs().length).toBe(1);
        expect(buf3.getOutputs().length).toBe(0);
        expect(buf4.getOutputs().length).toBe(0);

        a2.undo();
        c2.undo();
        c1.undo();

        a1.undo();

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(1);
        expect(buf2.getOutputs().length).toBe(1);
    });
    test("Undo/Redo 3", () => {
        const designer = new DigitalCircuitDesigner(0);
        const gate = new ANDGate();
        const buf1 = new BUFGate();

        Place(designer, [gate, buf1]);
        Connect(buf1, 0, gate, 0);
        Connect(buf1, 0, gate, 1);

        // before change
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(2);

        // change input count
        const a1 = new InputPortChangeAction(gate, 4).execute();

        // Connect some more things
        const c1 = Connect(buf1, 0, gate, 2);
        const c2 = Connect(buf1, 0, gate, 3);

        // before change2
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(4);
        expect(buf1.getOutputs().length).toBe(4);

        // change input count
        const a2 = new InputPortChangeAction(gate, 2).execute();

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(2);

        // reverted
        a2.undo();
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(4);
        expect(buf1.getOutputs().length).toBe(4);

        // back to initial
        a2.execute();
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(2);

        a2.undo();
        c2.undo();
        c1.undo();

        a1.undo();

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs().length).toBe(2);
        expect(buf1.getOutputs().length).toBe(2);
    });
});
