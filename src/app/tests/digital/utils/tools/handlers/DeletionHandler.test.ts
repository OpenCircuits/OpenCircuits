import "jest";

import {V} from "Vector";

import {Setup} from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";
import {ConstantHigh, ConstantLow} from "digital/models/ioobjects";
import {LED} from "digital/models/ioobjects/outputs/LED";


describe("DeletionHandler", () => {
    const {input, designer, selections} = Setup();
    const {Place} = GetHelpers(designer);


    afterEach(() => {
        designer.reset();
        selections.get().forEach(s => selections.deselect(s));
    });

    test("Deletion of a Single Object", () => {
        const [lo] = Place(new ConstantLow());

        expect(designer.getObjects()).toHaveLength(1);
        expect(selections.amount()).toBe(0);

        input.click(V(0, 0));

        expect(selections.amount()).toBe(1);

        input.pressKey("Delete")
            .releaseKey("Delete");

        expect(selections.amount()).toBe(0);
        expect(designer.getObjects()).toHaveLength(0);
    });
    test("Deletion of Nothing", () => {
        const [lo] = Place(new ConstantLow());

        expect(designer.getObjects()).toHaveLength(1);
        input.pressKey("Delete")
            .releaseKey("Delete");
        expect(designer.getObjects()).toHaveLength(1);
    });
    test("Deletion of Two Objects", () => {
        const [lo, hi] = Place(new ConstantLow(), new ConstantHigh());
        hi.setPos(V(100, 0));

        expect(designer.getObjects()).toHaveLength(2);
        expect(selections.amount()).toBe(0);

        input.click(V(0, 0))
            .pressKey("Shift")
            .click(V(100, 0))
            .releaseKey("Shift");
        expect(selections.amount()).toBe(2);

        input.pressKey("Delete")
             .releaseKey("Delete");

        expect(selections.amount()).toBe(0);
        expect(designer.getObjects()).toHaveLength(0);
    });
    test("Deletion of One Object Connected to Another", () => {
        const {Connect} = GetHelpers(designer);
        const [lo, a] = Place(new ConstantLow(), new LED());

        Connect(lo, a);

        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getWires()).toHaveLength(1);
        expect(selections.amount()).toBe(0);

        input.click(V(0, 0));

        expect(selections.amount()).toBe(1);

        input.pressKey("Delete")
            .releaseKey("Delete");
            
        expect(selections.amount()).toBe(0);
        expect(designer.getObjects()).toHaveLength(1);
        expect(designer.getWires()).toHaveLength(0);
    });
});