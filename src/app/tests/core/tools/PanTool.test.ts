import {MIDDLE_MOUSE_BUTTON} from "core/utils/Constants";

import {V} from "Vector";

import {Setup} from "test/helpers/Setup";


describe("Pan Tool", () => {
    const { camera, input, reset } = Setup();

    afterEach(() => reset());

    test("Drag without alt key", () => {
        input.drag(V(0, 0), V(-1, 0));
        expect(camera.getPos()).toEqual(V(0, 0));
    });

    test("Drag with alt key", () => {
        input.pressKey("Alt")
                .drag(V(0, 0), V(1, 0))
                .releaseKey("Alt");
        expect(camera.getPos()).toEqual(V(-1, 0));
    });

    test("No drag with alt key", () => {
        input.pressKey("Alt")
                .press(V(0, 0))
                .releaseKey("Alt")
                .release();
        expect(camera.getPos()).toEqual(V(0, 0));
    });

    test("Drag with alt key left mouse, release alt key", () => {
        input.pressKey("Alt")
            .press(V(0,0))
            .move(V(2, 0))
            .releaseKey("Alt")
            .move(V(4, 0))
            .release()
        expect(camera.getPos()).toEqual(V(-6, 0));
    });

    test("Drag with alt key left mouse, release left mouse", () => {
        input.pressKey("Alt")
            .press(V(0, 0))
            .move(V(2, 0))
            .release()
            .move(V(0, 2))
            .press()
            .move(V(4, 0))
            .releaseKey("Alt")
        expect(camera.getPos()).toEqual(V(-6, 0));
    });

    test("Drag with middle mouse", () => {
        input.drag(V(0, 0), V(20, 0), MIDDLE_MOUSE_BUTTON);
        expect(camera.getPos()).toEqual(V(-20, 0));
    });

    test("Drag with two fingers", () => {
        input.touch(V(-1, 0))
                .touch(V(1, 0))
                .moveTouches(V(1, 0))
                .releaseTouch()
                .releaseTouch();
        expect(camera.getPos()).toEqual(V(-1, 0));
    });

    test("Pan with arrow keys no shift", () => {
        // Checking up/right and down/left at the same time
        //  since they don't affect each other
        input.pressKey("ArrowUp")
                .releaseKey("ArrowUp")
                .pressKey("ArrowRight")
                .releaseKey("ArrowRight");
        expect(camera.getPos()).toEqual(V(1.5, 1.5));
        camera.setPos(V(0, 0));

        input.pressKey("ArrowDown")
                .releaseKey("ArrowDown")
                .pressKey("ArrowLeft")
                .releaseKey("ArrowLeft");
        expect(camera.getPos()).toEqual(V(-1.5, -1.5));
        camera.setPos(V(0, 0));
    });

    test("Pan with arrow keys holding shift", () => {
        // Checking up/right and down/left at the same time
        //  since they don't affect each other

        input.pressKey("Shift")
                .pressKey("ArrowUp")
                .releaseKey("ArrowUp")
                .pressKey("ArrowRight")
                .releaseKey("ArrowRight")
                .releaseKey("Shift");
        expect(camera.getPos()).toEqual(V(0.1, 0.1));
        camera.setPos(V(0, 0));

        input.pressKey("Shift")
                .pressKey("ArrowDown")
                .releaseKey("ArrowDown")
                .pressKey("ArrowLeft")
                .releaseKey("ArrowLeft")
                .releaseKey("Shift");
        expect(camera.getPos()).toEqual(V(-0.1, -0.1));
        camera.setPos(V(0, 0));
    });

});
