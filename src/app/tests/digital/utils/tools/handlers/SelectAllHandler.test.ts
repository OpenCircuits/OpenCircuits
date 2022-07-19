import "jest";

import {V} from "Vector";

import {Setup} from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";
import {ConstantHigh, ConstantLow} from "digital/models/ioobjects";


describe("SelectAllHandler", () => {
    const {input, designer, selections} = Setup();
    const {Place} = GetHelpers(designer);


    afterEach(() => {
        designer.reset();
        selections.get().forEach(s => selections.deselect(s));
    });

    test("Select All Objects", () => {
        const[lo, hi] = Place(new ConstantLow(), new ConstantHigh());

        expect(designer.getObjects()).toHaveLength(2);
        expect(selections.amount()).toBe(0);
        
        input.pressKey("Control")
            .pressKey("a") 
            .releaseKey("Control")
            .releaseKey("a");
        expect(selections.amount()).toBe(2);
        expect(designer.getObjects()).toHaveLength(2);
    });
    test("Selection of Nothing", () => {

        expect(designer.getObjects()).toHaveLength(0);
        expect(selections.amount()).toBe(0);

        input.pressKey("Control")
            .pressKey("a")
            .releaseKey("Control")
            .releaseKey("a");
        expect(selections.amount()).toBe(0);
        expect(designer.getObjects()).toHaveLength(0);
    });
});
