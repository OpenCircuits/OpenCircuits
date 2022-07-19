import "jest";

import {V} from "Vector";

import {Setup} from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";
import {ConstantHigh, ConstantLow} from "digital/models/ioobjects";


describe("DuplicationHandler", () => {
    const {input, designer, selections} = Setup();
    const {Place} = GetHelpers(designer);


    afterEach(() => {
        designer.reset();
        selections.get().forEach(s => selections.deselect(s));
    });

    test("Duplicate Single Object", () => {
        const[lo] = Place(new ConstantLow());

        expect(designer.getObjects()).toHaveLength(1);
        expect(selections.amount()).toBe(0);
        input.click(V(0, 0));
        expect(selections.amount()).toBe(1);
        input.pressKey("Control")
            .pressKey("d") 
            .releaseKey("Control")
            .releaseKey("d");
        expect(selections.amount()).toBe(1);
        expect(designer.getObjects()).toHaveLength(2);
    });
});
