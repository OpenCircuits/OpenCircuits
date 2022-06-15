import "jest";

import {CreateSplitWireAction} from "core/actions/addition/SplitWireAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {DigitalNode}            from "digital/models/ioobjects/other/DigitalNode";
import {Switch}                 from "digital/models/ioobjects/inputs/Switch";
import {LED}                    from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";


describe("Split Wire Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const {Place, Connect} = GetHelpers(designer);

        const [a, b] = Place(new Switch(), new LED());

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
        const ac = CreateSplitWireAction(designer, w, n);

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
