import "jest";

import {Vector, V} from "../../../../site/public/ts/utils/math/Vector";

import {FakeInput} from "./FakeInput";

describe("Fake Input", () => {
    const input = new FakeInput();

    let positions: Array<Vector> = [];
    let steps = 0;
    function step(): void {
        positions.push(input.getMousePos());
        steps++;
    }

    input.addListener("mousedown", () => step());
    input.addListener("mousemove", () => step());
    input.addListener("mouseup",   () => step());

    beforeEach(() => {
        positions = [];
        steps = 0;
    });

    test("Move To", () => {
        input.moveTo(V(20, 20), 5);

        expect(steps).toBe(5);
        expect(input.getMousePos()).toEqual(V(20, 20));
    });

    test("Drag", () => {
        input.drag(V(-20, 20),
                   V(20, -20), 5);

        expect(steps).toBe(7);
        expect(positions[0]).toEqual(V(-20, 20));
        expect(input.getMousePos()).toEqual(V(20, -20));
    });

});
