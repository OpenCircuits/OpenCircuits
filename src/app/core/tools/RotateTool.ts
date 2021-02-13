import {ROTATION_CIRCLE_R1,
        ROTATION_CIRCLE_R2,
        ROTATION_SNAP_AMT}  from "core/utils/Constants";
import {V, Vector} from "Vector";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {RotateAction} from "core/actions/transform/RotateAction";

import {Component} from "core/models";


export const RotateTool = (() => {
    let initialAngles = [] as number[];
    let currentAngles = [] as number[];

    let startAngle = 0;
    let prevAngle = 0;


    function isMouseOnCircle({camera, input, selections}: Partial<CircuitInfo>): boolean {
        const worldMousePos = camera.getWorldPos(input.getMousePos());
        const d = worldMousePos.sub(selections.midpoint()).len2();
        return (ROTATION_CIRCLE_R1 <= d && d <= ROTATION_CIRCLE_R2)
    }
    function getAngle(pos: Vector, mid: Vector): number {
        return pos.sub(mid).angle();
    }

    return {
        shouldActivate(event: Event, {locked, camera, input, selections}: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user pressed their mouse or finger down
            //  over the "rotation circle" which only appears if
            //  there are Components being selected
            return (event.type === "mousedown" &&
                    input.getTouchCount() === 1 &&
                    selections.amount() > 0 &&
                    selections.all(s => s instanceof Component) &&
                    isMouseOnCircle({camera, input, selections}));
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate only mouse release
            return (event.type === "mouseup");
        },


        onActivate({}: Event, {camera, input, selections}: CircuitInfo): void {
            const worldMousePos = camera.getWorldPos(input.getMousePos());
            const components = selections.get() as Component[];

            // Get initial component angles
            initialAngles = components.map(o => o.getAngle());
            currentAngles = initialAngles.slice();

            // Get initial overall angle
            startAngle = getAngle(worldMousePos, selections.midpoint());
            prevAngle = startAngle;

            return;
        },
        onDeactivate({}: Event, {history, selections}: CircuitInfo): void {
            const components = selections.get() as Component[];
            const finalAngles = components.map(o => o.getAngle());

            history.add(new RotateAction(components, selections.midpoint(), initialAngles, finalAngles));
        },


        onEvent(event: Event, {camera, input, selections}: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const worldMousePos = camera.getWorldPos(input.getMousePos());
            const components = selections.get() as Component[];
            const dAngle = getAngle(worldMousePos, selections.midpoint()) - prevAngle;

            // Calculate new angles
            currentAngles = currentAngles.map(a => a + dAngle);

            // Get snapped angles if shift is held
            const newAngles = input.isShiftKeyDown() ?
                currentAngles.map(a => Math.floor(a/ROTATION_SNAP_AMT)*ROTATION_SNAP_AMT) :
                currentAngles;

            // Set the rotations
            components.forEach((c, i) => c.setRotationAbout(newAngles[i], selections.midpoint()));

            prevAngle += dAngle;

            // Return true since we did something
            //  that requires a re-render
            return true;
        },


        getStartAngle(): number {
            return startAngle;
        },
        getPrevAngle(): number {
            return prevAngle;
        }
    }
})();
