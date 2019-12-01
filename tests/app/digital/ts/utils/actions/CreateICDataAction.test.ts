import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch} from "digital/models/ioobjects/inputs/Switch";
import {LED}    from "digital/models/ioobjects/outputs/LED";
import {ICData} from "digital/models/ioobjects/other/ICData";

import {CreateICDataAction} from "digital/actions/CreateICDataAction";

import {Place, Connect} from "test/helpers/Helpers";

describe("IC Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch(), b = new LED();

        Place(designer, [a]);
        Place(designer, [b]);
        Connect(a, 0, b, 0);

        // before ic creation
        expect(designer.getWires().length).toBe(1);
        expect(designer.getObjects().length).toBe(2);
        expect(designer.getICData().length).toBe(0);

        // connect
        const data = ICData.Create([a, b]);
        const ac = new CreateICDataAction(data, designer).execute();

        // initial
        expect(designer.getWires().length).toBe(1);
        expect(designer.getObjects().length).toBe(2);
        expect(designer.getICData().length).toBe(1);

        // reverted
        ac.undo();
        expect(designer.getWires().length).toBe(1);
        expect(designer.getObjects().length).toBe(2);
        expect(designer.getICData().length).toBe(0);

        // back to initial
        ac.execute();
        expect(designer.getWires().length).toBe(1);
        expect(designer.getObjects().length).toBe(2);
        expect(designer.getICData().length).toBe(1);
    });
});
