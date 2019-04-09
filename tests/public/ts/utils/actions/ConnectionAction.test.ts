import "jest";

import {CircuitDesigner}  from "../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}           from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED}              from "../../../../../site/public/ts/models/ioobjects/outputs/LED";
import {ConnectionAction} from "../../../../../site/public/ts/utils/actions/ConnectionAction";

describe("PlaceAction", () => {
    it("Undo/Redo 1", () => {
        const designer = new CircuitDesigner(0);
        const a = new Switch(), b = new LED();

        designer.addObject(a);
        designer.addObject(b);

        a.activate(true);

        // before connection
        expect(designer.getWires().length).toBe(0);
        expect(a.getOutputs().length).toBe(0);
        expect(b.getInputs().length).toBe(0);
        expect(b.isOn()).toBe(false);

        // connect
        const wire = designer.connect(a, 0,  b, 0);
        const a1 = new ConnectionAction(wire);

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
