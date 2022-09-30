import {GetHelpers} from "test/helpers/Helpers";

import {AddICData} from "digital/actions/units/AddICData";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {ICData} from "digital/models/ioobjects/other/ICData";

import {LED} from "digital/models/ioobjects/outputs/LED";


describe("IC Action", () => {
    test("Undo/Redo 1", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { Place, Connect } = GetHelpers(designer);

        const [a, b] = Place(new Switch(), new LED());
        Connect(a, b);

        // before ic creation
        expect(designer.getWires()).toHaveLength(1);
        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getICData()).toHaveLength(0);

        // connect
        const data = ICData.Create([a, b])!;
        const ac = AddICData(data, designer);

        // initial
        expect(designer.getWires()).toHaveLength(1);
        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getICData()).toHaveLength(1);

        // reverted
        ac.undo();
        expect(designer.getWires()).toHaveLength(1);
        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getICData()).toHaveLength(0);

        // back to initial
        ac.execute();
        expect(designer.getWires()).toHaveLength(1);
        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getICData()).toHaveLength(1);
    });
});
