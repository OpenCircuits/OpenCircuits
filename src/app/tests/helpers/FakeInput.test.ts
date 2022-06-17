import "jest";

import {V, Vector} from "Vector";

import {FakeInput} from "./FakeInput";


describe("Fake Input", () => {
    const input = new FakeInput();

    let positions: Vector[] = [];
    let steps = 0;

    function step(): void {
        positions.push(input.getMousePos());
        steps++;
    }

    input.addListener(({type}) => {
        if (type === "mousedown" || type ==="mousemove" || type === "mouseup")
            step();
    });

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
        expect(input.getMouseDownPos()).toEqual(V(-20, 20));
        expect(input.getMousePos()).toEqual(V(20, -20));
    });
});
