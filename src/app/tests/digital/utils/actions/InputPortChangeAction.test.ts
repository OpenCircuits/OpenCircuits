import {GetHelpers} from "test/helpers/Helpers";

import {SetInputPortCount} from "digital/actions/units/SetInputPortCount";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {BUFGate} from "digital/models/ioobjects/gates/BUFGate";


describe("Input Port Change Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place } = GetHelpers(designer);

        const [gate] = Place(new ANDGate());

        // before connection
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);

        // connect
        const a1 = SetInputPortCount(gate, 5);

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
        const { Place, Connect } = GetHelpers(designer);

        const [gate, buf1, buf2, buf3, buf4] = Place(new ANDGate(), new BUFGate(), new BUFGate(),
                                                     new BUFGate(), new BUFGate());
        Connect(buf1, gate);
        Connect(buf2, gate);

        // before change
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(1);
        expect(buf2.getOutputs()).toHaveLength(1);

        // change input count
        const a1 = SetInputPortCount(gate, 4);

        // Connect some more things
        const [c1] = Connect(buf3, gate);
        const [c2] = Connect(buf4, gate);

        // before change2
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(4);
        expect(buf1.getOutputs()).toHaveLength(1);
        expect(buf2.getOutputs()).toHaveLength(1);
        expect(buf3.getOutputs()).toHaveLength(1);
        expect(buf4.getOutputs()).toHaveLength(1);

        // change input count
        const a2 = SetInputPortCount(gate, 2);

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(1);
        expect(buf2.getOutputs()).toHaveLength(1);
        expect(buf3.getOutputs()).toHaveLength(0);
        expect(buf4.getOutputs()).toHaveLength(0);

        // reverted
        a2.undo();
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(4);
        expect(buf1.getOutputs()).toHaveLength(1);
        expect(buf2.getOutputs()).toHaveLength(1);
        expect(buf3.getOutputs()).toHaveLength(1);
        expect(buf4.getOutputs()).toHaveLength(1);

        // back to initial
        a2.execute();
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(1);
        expect(buf2.getOutputs()).toHaveLength(1);
        expect(buf3.getOutputs()).toHaveLength(0);
        expect(buf4.getOutputs()).toHaveLength(0);

        a2.undo();
        c2.undo();
        c1.undo();

        a1.undo();

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(1);
        expect(buf2.getOutputs()).toHaveLength(1);
    });
    test("Undo/Redo 3", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);

        const [gate, buf1] = Place(new ANDGate(), new BUFGate());
        Connect(buf1, gate);
        Connect(buf1, gate);

        // before change
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(2);

        // change input count
        const a1 = SetInputPortCount(gate, 4);

        // Connect some more things
        const [c1] = Connect(buf1, gate);
        const [c2] = Connect(buf1, gate);

        // before change2
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(4);
        expect(buf1.getOutputs()).toHaveLength(4);

        // change input count
        const a2 = SetInputPortCount(gate, 2);

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(2);

        // reverted
        a2.undo();
        expect(gate.getInputPortCount().getValue()).toBe(4);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(4);
        expect(buf1.getOutputs()).toHaveLength(4);

        // back to initial
        a2.execute();
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(2);

        a2.undo();
        c2.undo();
        c1.undo();

        a1.undo();

        // initial
        expect(gate.getInputPortCount().getValue()).toBe(2);
        expect(gate.getOutputPortCount().getValue()).toBe(1);
        expect(gate.getInputs()).toHaveLength(2);
        expect(buf1.getOutputs()).toHaveLength(2);
    });
});
