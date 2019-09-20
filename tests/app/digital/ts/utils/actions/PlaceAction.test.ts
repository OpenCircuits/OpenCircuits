import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";

import {PlaceAction} from "digital/actions/addition/PlaceAction";

describe("PlaceAction", () => {
    it("Undo/Redo", () => {
        const designer = new DigitalCircuitDesigner(0);
        const a = new Switch();

        designer.addObject(a);
        const a1 = new PlaceAction(designer, a);

        expect(designer.getObjects().length).toBe(1);
        expect(designer.getObjects()[0]).toBe(a);

        a1.undo();
        expect(designer.getObjects().length).toBe(0);

        a1.execute();
        expect(designer.getObjects().length).toBe(1);
        expect(designer.getObjects()[0]).toBe(a);
    });
});
