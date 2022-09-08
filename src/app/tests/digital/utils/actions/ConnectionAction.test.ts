import {GetHelpers} from "test/helpers/Helpers";

import {Connect} from "core/actions/units/Connect";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {LED} from "digital/models/ioobjects/outputs/LED";



describe("Connection Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place } = GetHelpers(designer);

        const [a, b] = Place(new Switch(), new LED());

        a.activate(true);

        // before connection
        expect(designer.getWires()).toHaveLength(0);
        expect(a.getOutputs()).toHaveLength(0);
        expect(b.getInputs()).toHaveLength(0);
        expect(b.isOn()).toBe(false);

        // connect
        const a1 = Connect(designer, a.getOutputPort(0), b.getInputPort(0));

        // initial
        expect(designer.getWires()).toHaveLength(1);
        expect(a.getOutputs()).toHaveLength(1);
        expect(b.getInputs()).toHaveLength(1);
        expect(b.isOn()).toBe(true);

        // reverted
        a1.undo();
        expect(designer.getWires()).toHaveLength(0);
        expect(a.getOutputs()).toHaveLength(0);
        expect(b.getInputs()).toHaveLength(0);
        expect(b.isOn()).toBe(false);

        // back to initial
        a1.execute();
        expect(designer.getWires()).toHaveLength(1);
        expect(a.getOutputs()).toHaveLength(1);
        expect(b.getInputs()).toHaveLength(1);
        expect(b.isOn()).toBe(true);
    });
});
