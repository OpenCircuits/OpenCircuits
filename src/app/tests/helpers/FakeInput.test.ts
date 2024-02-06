import {V, Vector} from "Vector";

import {Camera} from "math/Camera";

import "./Extensions";
import {FakeInput} from "./FakeInput";


describe("Fake Input", () => {
    const camera = new Camera(500, 500);
    const input = new FakeInput(camera);

    let positions: Vector[] = [];
    let steps = 0;

    function step(): void {
        positions.push(input.getMousePos());
        steps++;
    }

    input.addListener(({ type }) => {
        if (type === "mousedown" || type ==="mousemove" || type === "mouseup")
            step();
    });

    beforeEach(() => {
        positions = [];
        steps = 0;
        camera.setPos(V(0, 0));
        input.reset();
    });

    test("Move To", () => {
        // Move to is in world position
        input.moveTo(V(1, 1), 5);

        expect(steps).toBe(5);
        expect(input.getMousePos().sub(camera.getCenter())).toApproximatelyEqual(V(50, -50));
    });

    test("Move", () => {
        input.moveTo(V(0, 0), 5);

        // Move is in world position
        input.move(V(1, 1), 5);

        expect(steps).toBe(10);
        expect(input.getMousePos().sub(camera.getCenter())).toApproximatelyEqual(V(50, -50));

        // Move is in world position
        input.move(V(2, 3), 5);

        expect(steps).toBe(15);
        expect(input.getMousePos().sub(camera.getCenter())).toApproximatelyEqual(V(150, -200));
    });

    test("Drag", () => {
        input.drag(V(-1, 1),
                   V(1, -1), 5);

        expect(steps).toBe(7);
        expect(positions[0].sub(camera.getCenter())).toApproximatelyEqual(V(-50, -50));
        expect(input.getMouseDownPos().sub(camera.getCenter())).toApproximatelyEqual(V(-50, -50));
        expect(input.getMousePos().sub(camera.getCenter())).toApproximatelyEqual(V(50, 50));
    });

    test("Camera Move", () => {
        camera.setPos(V(1, 1));

        input.moveTo(V(1, 1), 1);

        expect(input.getMousePos().sub(camera.getCenter())).toApproximatelyEqual(V(0, 0));

        input.moveTo(V(2, 0), 1);

        expect(input.getMousePos().sub(camera.getCenter())).toApproximatelyEqual(V(50, 50));

        input.moveTo(V(4, 0), 1);

        expect(input.getMousePos().sub(camera.getCenter())).toApproximatelyEqual(V(150, 50));
    });
});
