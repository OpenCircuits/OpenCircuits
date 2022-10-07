import {V} from "Vector";

import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {ConstantHigh, ConstantLow} from "digital/models/ioobjects";


describe("SelectionHandler", () => {
    const { input, designer, selections } = Setup();
    const { Place } = GetHelpers(designer);


    afterEach(() => {
        designer.reset();
        selections.get().forEach((s) => selections.deselect(s));
    });

    test("Select Single Object", () => {
        const [lo] = Place(new ConstantLow());

        expect(selections.amount()).toBe(0);
        input.click(V(0, 0));
        expect(selections.amount()).toBe(1);

        expect(selections.get()[0]).toBe(lo);
    });
    test("Select Object ontop of Other", () => {
        const [, hi] = Place(new ConstantLow(), new ConstantHigh());

        expect(selections.amount()).toBe(0);
        input.click(V(0, 0));
        expect(selections.amount()).toBe(1);

        expect(selections.get()[0]).toBe(hi);

        // Click again and nothing should change
        input.click(V(0, 0));
        expect(selections.amount()).toBe(1);
        expect(selections.get()[0]).toBe(hi);
    });
    test("Select Two Objects", () => {
        const [lo, hi] = Place(new ConstantLow(), new ConstantHigh());
        hi.setPos(V(2, 0));

        expect(selections.amount()).toBe(0);
        input.click(V(0, 0))
            .pressKey("Shift")
            .click(V(2, 0))
            .releaseKey("Shift");
        expect(selections.amount()).toBe(2);

        expect(selections.get()[0]).toBe(lo);
        expect(selections.get()[1]).toBe(hi);
    });
});
