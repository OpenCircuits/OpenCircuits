import "jest";

import {V} from "Vector";

import "test/helpers/Extensions";
import {Setup} from "test/helpers/Setup";
import {GetHelpers} from "test/helpers/Helpers";
import {ConstantHigh, ConstantLow} from "digital/models/ioobjects";
import {LED} from "digital/models/ioobjects/outputs/LED";



describe("DuplicationHandler", () => {
    const {input, designer, selections} = Setup();
    const {Place} = GetHelpers(designer);


    afterEach(() => {
        designer.reset();
        selections.get().forEach(s => selections.deselect(s));
    });

    test("Duplicate Single Object", () => {
        const [lo] = Place(new ConstantLow());

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
        expect(selections.get()).not.toContain(lo);
    });
    test("Duplicate Two Objects", () => {
        const [lo, hi] = Place(new ConstantLow(), new ConstantHigh());
        hi.setPos(V(100, 0));

        expect(designer.getObjects()).toHaveLength(2);
        expect(selections.amount()).toBe(0);

        input.click(V(0, 0))
            .pressKey("Shift")
            .click(V(100, 0))
            .releaseKey("Shift");
        expect(selections.amount()).toBe(2);

        input.pressKey("Control")
            .pressKey("d")
            .releaseKey("Control")
            .releaseKey("d");

        expect(selections.amount()).toBe(2);
        expect(designer.getObjects()).toHaveLength(4);
        expect(selections.get()).not.toContain(lo);
        expect(selections.get()).not.toContain(hi);
    });
    test("Duplicate Nothing", () => {
        const [lo, hi] = Place(new ConstantLow(), new ConstantHigh());

        expect(designer.getObjects()).toHaveLength(2);
        expect(selections.amount()).toBe(0);

        input.pressKey("Control")
            .pressKey("d")
            .releaseKey("Control")
            .releaseKey("d");

        expect(selections.amount()).toBe(0);
        expect(designer.getObjects()).toHaveLength(2);
    });
    test("Duplication of Two Connected Objects", () => {
        const {Connect} = GetHelpers(designer);
        const [lo, a] = Place(new ConstantLow(), new LED());
        a.setPos(V(100, 0));

        Connect(lo, a);

        expect(designer.getObjects()).toHaveLength(2);
        expect(designer.getWires()).toHaveLength(1);
        expect(selections.amount()).toBe(0);

        input.click(V(0, 0))
            .pressKey("Shift")
            .click(V(100, 0))
            .releaseKey("Shift");
            
        expect(selections.amount()).toBe(2);

        input.pressKey("Control")
            .pressKey("d")
            .releaseKey("Control")
            .releaseKey("d");

        expect(selections.amount()).toBe(2);
        expect(designer.getObjects()).toHaveLength(4);
        expect(designer.getWires()).toHaveLength(2);
        expect(selections.get()).not.toContain(lo);
        expect(selections.get()).not.toContain(a);
        expect(lo).toBeConnectedTo(a);
    });
});