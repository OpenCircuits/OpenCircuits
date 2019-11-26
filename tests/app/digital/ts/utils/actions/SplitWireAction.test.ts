import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {Place, Connect} from "test/helpers/Helpers";
import {CreateSplitWireAction} from "core/actions/addition/SplitWireAction";
import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";

describe("Split Wire Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), b = new LED();

        Place(designer, [a]);
        Place(designer, [b]);

        const w = Connect(a, 0, b, 0).getWire();

        // before split
        expect(designer.getObjects().length).toBe(2);
        expect(designer.getWires().length).toBe(1);
        expect(designer.getWires()[0]).toBe(w);
        expect(a.getOutputs().length).toBe(1);
        expect(a.getOutputs()[0]).toBe(w);
        expect(b.getInputs().length).toBe(1);
        expect(b.getInputs()[0]).toBe(w);

        const n = new DigitalNode();
        const ac = CreateSplitWireAction(w, n).execute();

        // after split
        expect(designer.getObjects().length).toBe(3);
        expect(designer.getWires().length).toBe(2);
        expect(a.getOutputs().length).toBe(1);
        expect(a.getOutputs()[0]).toBe(n.getInputs()[0]);
        expect(n.getInputs().length).toBe(1);
        expect(n.getOutputs().length).toBe(1);
        expect(b.getInputs().length).toBe(1);
        expect(b.getInputs()[0]).toBe(n.getOutputs()[0]);

        // undo
        ac.undo();

        expect(designer.getObjects().length).toBe(2);
        expect(designer.getWires().length).toBe(1);
        expect(designer.getWires()[0]).toBe(w);
        expect(a.getOutputs().length).toBe(1);
        expect(a.getOutputs()[0]).toBe(w);
        expect(b.getInputs().length).toBe(1);
        expect(b.getInputs()[0]).toBe(w);

        // redo
        ac.execute();

        expect(designer.getObjects().length).toBe(3);
        expect(designer.getWires().length).toBe(2);
        expect(a.getOutputs().length).toBe(1);
        expect(a.getOutputs()[0]).toBe(n.getInputs()[0]);
        expect(n.getInputs().length).toBe(1);
        expect(n.getOutputs().length).toBe(1);
        expect(b.getInputs().length).toBe(1);
        expect(b.getInputs()[0]).toBe(n.getOutputs()[0]);
    });
});
