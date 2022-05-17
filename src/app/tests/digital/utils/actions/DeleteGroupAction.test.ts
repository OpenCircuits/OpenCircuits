import "jest";

import {ConnectionAction} from "core/actions/addition/ConnectionAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}                 from "digital/models/ioobjects/inputs/Switch";
import {LED}                    from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";


describe("Delete Group Action", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect } = GetHelpers(designer);

    afterEach(() => {
        designer.reset();
    });

    test("Basic Deletion of 1 object", () => {
        const [a] = Place(new Switch());

        expect(designer.getObjects()).toContain(a);

        const a1 = CreateDeleteGroupAction(designer, [a]).execute();

        expect(designer.getObjects()).not.toContain(a);

        a1.undo();

        expect(designer.getObjects()).toContain(a);
    });
    test("Basic Deletion of 1 wire", () => {
        const [a, b] = Place(new Switch(), new LED());
        const [w] = Connect(a, b);

        expect(designer.getObjects()).toContain(a);

        const a1 = CreateDeleteGroupAction(designer, [a]).execute();

        expect(designer.getObjects()).not.toContain(a);

        a1.undo();

        expect(designer.getObjects()).toContain(a);
    });
});
