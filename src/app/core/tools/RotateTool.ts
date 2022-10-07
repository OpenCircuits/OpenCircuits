import {ROTATION_CIRCLE_RADIUS,
        ROTATION_CIRCLE_THICKNESS} from "core/utils/Constants";

import {Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event}       from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {Rotate}    from "core/actions/units/Rotate";
import {Translate} from "core/actions/units/Translate";

import {Component} from "core/models";


const ROTATION_SNAP_AMT = Math.PI/4;
const ROTATION_CIRCLE_THRESHOLD = ROTATION_CIRCLE_THICKNESS + 0.06;
const ROTATION_CIRCLE_R1 = (ROTATION_CIRCLE_RADIUS - ROTATION_CIRCLE_THRESHOLD) ** 2;
const ROTATION_CIRCLE_R2 = (ROTATION_CIRCLE_RADIUS + ROTATION_CIRCLE_THRESHOLD) ** 2;

export const RotateTool = (() => {
    let initialPositions = [] as Vector[];

    let initialAngles = [] as number[];
    let currentAngles = [] as number[];

    let startAngle = 0;
    let prevAngle = 0;

    function isMouseOnCircle({ camera, input, selections }: CircuitInfo): boolean {
        const worldMousePos = camera.getWorldPos(input.getMousePos());
        const d = worldMousePos.sub(selections.midpoint()).len2();
        return (ROTATION_CIRCLE_R1 <= d && d <= ROTATION_CIRCLE_R2)
    }
    function getAngle(pos: Vector, mid: Vector): number {
        return pos.sub(mid).angle();
    }

    return {
        shouldActivate(event: Event, info: CircuitInfo): boolean {
            const { input, selections, locked } = info;
            if (locked)
                return false;
            // Activate if the user pressed their mouse or finger down
            //  over the "rotation circle" which only appears if
            //  there are Components being selected
            return (event.type === "mousedown" &&
                    input.getTouchCount() === 1 &&
                    selections.amount() > 0 &&
                    selections.all((s) => s instanceof Component) &&
                    isMouseOnCircle(info));
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate only mouse release
            return (event.type === "mouseup");
        },


        onActivate({}: Event, { camera, input, selections }: CircuitInfo): void {
            const worldMousePos = camera.getWorldPos(input.getMousePos());
            const components = selections.get() as Component[];

            // Get initial component angles
            initialAngles = components.map((o) => o.getAngle());
            currentAngles = [...initialAngles];

            // Get initial positions as well since we can rotate around a point which moves the components
            initialPositions = components.map((o) => o.getPos());

            // Get initial overall angle
            startAngle = getAngle(worldMousePos, selections.midpoint());
            prevAngle = startAngle;
        },
        onDeactivate({}: Event, { history, selections }: CircuitInfo): void {
            const components = selections.get() as Component[];
            const finalAngles = components.map((o) => o.getAngle());
            const finalPositions = components.map((o) => o.getPos());

            // Translate and rotate back to original position, so that it undo's properly
            // TODO: use a `tempAction` instead so that they don't need to be stored
            Translate(components, initialPositions);
            components.forEach((c, i) => Rotate(c, initialAngles[i]));

            history.add(
                new GroupAction([
                    Translate(components, finalPositions),
                    new GroupAction(
                        components.map((o,i) => Rotate(o, finalAngles[i])),
                        "Rotation"
                    ),
                ], "Rotation")
            );
        },


        onEvent(event: Event, { camera, input, selections }: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            // Get whether z is presesed for independent rotation
            const isIndependent = input.isKeyDown("z");

            const worldMousePos = camera.getWorldPos(input.getMousePos());
            const components = selections.get() as Component[];

            const midpoint = selections.midpoint();

            const dAngle = getAngle(worldMousePos, midpoint) - prevAngle;

            // Calculate new angles
            currentAngles = currentAngles.map((a) => a + dAngle);

            // Get snapped angles if shift is held
            const newAngles = input.isShiftKeyDown() ?
                currentAngles.map((a) => Math.floor(a/ROTATION_SNAP_AMT)*ROTATION_SNAP_AMT) :
                currentAngles;

            // Rotate independently if z is held
            if (isIndependent)
                components.forEach((c, i) => c.setAngle(newAngles[i]));
            else
                components.forEach((c, i) => c.setRotationAbout(newAngles[i], midpoint));

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
        },
    }
})();
