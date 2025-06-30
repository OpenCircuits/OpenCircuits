/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {MIDDLE_MOUSE_BUTTON} from "shared/api/circuitdesigner/input/Constants";

import {CreateTestCircuitDesigner} from "tests/helpers/CreateTestCircuitDesigner";


describe("PanTool", () => {
    test("Drag without alt key", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        input.drag(V(0, 0), V(-1, 0));
        expect(camera.pos).toEqual(V(0, 0));
    });

    test("Drag with alt key", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        input.pressKey("Alt")
                .drag(V(0, 0), V(1, 0))
                .releaseKey("Alt");
        expect(camera.pos).toEqual(V(-1, 0));
    });

    test("No drag with alt key", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        input.pressKey("Alt")
                .press(V(0, 0))
                .releaseKey("Alt")
                .release();
        expect(camera.pos).toEqual(V(0, 0));
    });

    test("Drag with alt key left mouse, release alt key", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        input.pressKey("Alt")
            .press(V(0,0))
            .move(V(2, 0))
            .releaseKey("Alt")
            .move(V(4, 0))
            .release()
        expect(camera.pos).toEqual(V(-6, 0));
    });

    test("Drag with alt key left mouse, release left mouse", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        input.pressKey("Alt")
            .press(V(0, 0))
            .move(V(2, 0))
            .release()
            .move(V(0, 2))
            .press()
            .move(V(4, 0))
            .releaseKey("Alt")
        expect(camera.pos).toEqual(V(-6, 0));
    });

    test("Drag with middle mouse", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        input.drag(V(0, 0), V(20, 0), MIDDLE_MOUSE_BUTTON);
        expect(camera.pos).toEqual(V(-20, 0));
    });

    test("Drag with two fingers", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        input.touch(V(-1, 0))
                .touch(V(1, 0))
                .moveTouches(V(1, 0))
                .releaseTouch()
                .releaseTouch();
        expect(camera.pos).toEqual(V(-1, 0));
    });

    test("Pan with arrow keys no shift", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        // Checking up/right and down/left at the same time
        //  since they don't affect each other
        input.pressKey("ArrowUp")
                .releaseKey("ArrowUp")
                .pressKey("ArrowRight")
                .releaseKey("ArrowRight");
        expect(camera.pos).toEqual(V(1.5, 1.5));
        camera.pos = V(0, 0);

        input.pressKey("ArrowDown")
                .releaseKey("ArrowDown")
                .pressKey("ArrowLeft")
                .releaseKey("ArrowLeft");
        expect(camera.pos).toEqual(V(-1.5, -1.5));
        camera.pos = V(0, 0);
    });

    test("Pan with arrow keys holding shift", () => {
        const [designer, input, _] = CreateTestCircuitDesigner();
        const camera = designer.viewport.camera;

        // Checking up/right and down/left at the same time
        //  since they don't affect each other

        input.pressKey("Shift")
                .pressKey("ArrowUp")
                .releaseKey("ArrowUp")
                .pressKey("ArrowRight")
                .releaseKey("ArrowRight")
                .releaseKey("Shift");
        expect(camera.pos).toEqual(V(0.1, 0.1));
        camera.pos = V(0, 0);

        input.pressKey("Shift")
                .pressKey("ArrowDown")
                .releaseKey("ArrowDown")
                .pressKey("ArrowLeft")
                .releaseKey("ArrowLeft")
                .releaseKey("Shift");
        expect(camera.pos).toEqual(V(-0.1, -0.1));
        camera.pos = V(0, 0);
    });
});
