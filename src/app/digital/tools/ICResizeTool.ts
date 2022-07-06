import {DEFAULT_BORDER_WIDTH, LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {V} from "Vector";

import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {Event} from "core/utils/Events";

import {ICCircuitInfo} from "digital/utils/ICCircuitInfo";


export type ICEdge = "horizontal" | "vertical" | "none";

export const ICResizeTool = (() => {
    let edge: ICEdge = "none";

    function findEdge({ input, camera, ic }: ICCircuitInfo): ICEdge {
        if (!ic)
            throw new Error("ICResizeTool.findEdge failed: ic is undefined");
        // Create slightly larger and smaller box and check
        //  if the mouse is between the two for an edge check
        const t1 = new Transform(ic.getPos(), ic.getSize().add(V(DEFAULT_BORDER_WIDTH*5)));
        const t2 = new Transform(ic.getPos(), ic.getSize().sub(V(DEFAULT_BORDER_WIDTH*5)));

        const worldMousePos = camera.getWorldPos(input.getMousePos());
        if (!(RectContains(t1, worldMousePos) && !RectContains(t2, worldMousePos)))
            return "none";

        // Determine if mouse is over horizontal or vertical edge
        return (worldMousePos.y < ic.getPos().y + ic.getSize().y/2 - DEFAULT_BORDER_WIDTH*5/2 &&
                worldMousePos.y > ic.getPos().y - ic.getSize().y/2 + DEFAULT_BORDER_WIDTH*5/2)
               ? "horizontal"
               : "vertical";
    }

    return {
        shouldActivate(event: Event, info: ICCircuitInfo): boolean {
            // Activate if the user began dragging over an edge
            return (event.type === "mousedrag" &&
                    event.button === LEFT_MOUSE_BUTTON &&
                    info.input.getTouchCount() === 1 &&
                    findEdge(info) !== "none");
        },
        shouldDeactivate(event: Event, _: ICCircuitInfo): boolean {
            // Deactivate if stopped dragging by releasing mouse
            return (event.type === "mouseup");
        },


        onActivate(event: Event, info: ICCircuitInfo): void {
            edge = findEdge(info);
            if (event.type === "mousedrag")
                this.onEvent(event, info); // Explicitly call drag event
        },
        onDeactivate(): void {
            edge = "none";
        },


        onEvent(event: Event, { input, camera, ic }: ICCircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            if (!ic)
                throw new Error("ICResizeTool.onEvent failed: ic was undefined");

            const data = ic.getData();
            const worldMousePos = camera.getWorldPos(input.getMousePos());


            const originalSize = data.getSize();
            const newSize = (worldMousePos.sub(ic.getPos())).scale(2).abs();

            if (edge === "horizontal")
                data.setSize(V(newSize.x, originalSize.y));
            else if (edge === "vertical")
                data.setSize(V(originalSize.x, newSize.y));

            data.positionPorts();
            ic.update();

            // Return true since we did something
            //  that requires a re-render
            return true;
        },


        findEdge: findEdge,
    }
})();
