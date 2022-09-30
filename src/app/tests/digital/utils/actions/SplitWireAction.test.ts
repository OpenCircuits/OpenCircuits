import {GetHelpers} from "test/helpers/Helpers";

import {SplitWire} from "core/actions/compositions/SplitWire";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {DigitalNode} from "digital/models/ioobjects/other/DigitalNode";

import {LED} from "digital/models/ioobjects/outputs/LED";



describe("Split Wire Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);

        const [a, b] = Place(new Switch(), new LED());

        const w = Connect(a, b)[0].getWire();

        // before split
        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getWires()).toHaveLength(1);
        expect(designer.getWires()[0]).toBe(w);
        expect(a.getOutputs()).toHaveLength(1);
        expect(a.getOutputs()[0]).toBe(w);
        expect(b.getInputs()).toHaveLength(1);
        expect(b.getInputs()[0]).toBe(w);

        const n = new DigitalNode();
        const ac = SplitWire(designer, w, n);

        // after split
        expect(designer.getObjects()).toHaveLength(3);
        expect(designer.getWires()).toHaveLength(2);
        expect(a.getOutputs()).toHaveLength(1);
        expect(a.getOutputs()[0]).toBe(n.getInputs()[0]);
        expect(n.getInputs()).toHaveLength(1);
        expect(n.getOutputs()).toHaveLength(1);
        expect(b.getInputs()).toHaveLength(1);
        expect(b.getInputs()[0]).toBe(n.getOutputs()[0]);

        // undo
        ac.undo();

        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getWires()).toHaveLength(1);
        expect(designer.getWires()[0]).toBe(w);
        expect(a.getOutputs()).toHaveLength(1);
        expect(a.getOutputs()[0]).toBe(w);
        expect(b.getInputs()).toHaveLength(1);
        expect(b.getInputs()[0]).toBe(w);

        // redo
        ac.execute();

        expect(designer.getObjects()).toHaveLength(3);
        expect(designer.getWires()).toHaveLength(2);
        expect(a.getOutputs()).toHaveLength(1);
        expect(a.getOutputs()[0]).toBe(n.getInputs()[0]);
        expect(n.getInputs()).toHaveLength(1);
        expect(n.getOutputs()).toHaveLength(1);
        expect(b.getInputs()).toHaveLength(1);
        expect(b.getInputs()[0]).toBe(n.getOutputs()[0]);
    });
});
