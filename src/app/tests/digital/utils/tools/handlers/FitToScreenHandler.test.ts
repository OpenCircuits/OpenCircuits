import {V} from "Vector";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {ConstantLow} from "digital/models/ioobjects";

import {LED} from "digital/models/ioobjects/outputs/LED";


describe("FitToScreenHandler", () => {
    const { input, designer, selections, camera } = Setup();
    const { Place } = GetHelpers(designer);

    afterEach(() => {
        designer.reset();
        selections.get().forEach((s) => selections.deselect(s));
    });

    test("Fit to Screen of a Single Object", () => {
        Place(new ConstantLow());

        expect(designer.getObjects()).toHaveLength(1)
        expect(selections.amount()).toBe(0);

        input.click(V(0, 0));

        expect(selections.amount()).toBe(1);

        input.pressKey("f")
            .releaseKey("f");

        expect(selections.amount()).toBe(1);
        expect(camera.getPos()).toApproximatelyEqual(V(0.43, 0));

    });

    test("Fit to Screen with no objects", () => {

        expect(designer.getObjects()).toHaveLength(0)
        expect(selections.amount()).toBe(0);

        input.pressKey("f")
            .releaseKey("f");

        expect(selections.amount()).toBe(0);
        expect(camera.getPos()).toEqual(V(0, 0));

    });

    test("Fit to Screen of Two Connected Objects", () => {
        const { Connect } = GetHelpers(designer);
        const [lo, a] = Place(new ConstantLow(), new LED());

        Connect(lo, a);

        expect(designer.getObjects()).toHaveLength(2)
        expect(designer.getWires()).toHaveLength(1);
        expect(selections.amount()).toBe(0);

        input.click(V(0, 0));

        expect(selections.amount()).toBe(1);

        input.pressKey("f")
            .releaseKey("f");

        expect(selections.amount()).toBe(1);
        expect(camera.getPos()).toApproximatelyEqual(V(0, -0.81));
    });
});
