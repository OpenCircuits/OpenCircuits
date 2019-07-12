import "jest";

import {V} from "../../../../site/public/ts/utils/math/Vector";

import {FakeInput} from "./FakeInput";

describe("Fake Input", () => {
    const input = new FakeInput();

    let steps = 0;
    input.addListener("mousemove", () => {
        steps++;
    });

    beforeEach(() => {
        steps = 0;
    });

    test("Move To", () => {
        input.moveTo(V(20, 20), 5);

        expect(steps).toBe(5);
        expect(input.getMousePos()).toEqual(V(20, 20));
    });

});
