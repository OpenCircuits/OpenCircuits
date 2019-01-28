import "jest";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Switch}          from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {PlaceAction}     from "../../../../../site/public/ts/utils/actions/PlaceAction";

describe("PlaceAction", () => {
    it("Undo/Redo", () => {
        var designer = new CircuitDesigner(0);
        var a = new Switch();

        var a1 = new PlaceAction(designer, a);
        a1.execute();

        expect(designer.getObjects().length).toBe(1);
        expect(designer.getObjects()[0]).toBe(a);

        a1.undo();
        expect(designer.getObjects().length).toBe(0);

        a1.execute();
        expect(designer.getObjects().length).toBe(1);
        expect(designer.getObjects()[0]).toBe(a);
    });
});
