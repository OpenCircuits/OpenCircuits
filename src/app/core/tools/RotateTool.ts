import {ROTATION_CIRCLE_RADIUS,
        ROTATION_CIRCLE_THICKNESS} from "core/utils/Constants";

import {V} from "Vector";

import {CircuitInfo}                               from "core/utils/CircuitInfo";
import {CalcSelectionsMidpoint, CalcWorldMousePos} from "core/utils/CircuitInfoUtils";
import {InputManagerEvent}                         from "core/utils/InputManager";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {SetTransform} from "core/actions/compositions/SetTransform";

import {SetProperty} from "core/actions/units/SetProperty";

import {AnyComponent} from "core/models/types";


const ROTATION_SNAP_AMT = Math.PI/4;
const ROTATION_CIRCLE_THRESHOLD = ROTATION_CIRCLE_THICKNESS + 0.06;
const ROTATION_CIRCLE_R1 = (ROTATION_CIRCLE_RADIUS - ROTATION_CIRCLE_THRESHOLD) ** 2;
const ROTATION_CIRCLE_R2 = (ROTATION_CIRCLE_RADIUS + ROTATION_CIRCLE_THRESHOLD) ** 2;

export const RotateTool = (() => {
    let curAngles = [] as number[];
    let curAroundAngle = 0;

    let startAngle = 0;
    let prevAngle = 0;

    let tempAction: Action | undefined;

    function isMouseOnCircle(info: CircuitInfo): boolean {
        const worldMousePos = CalcWorldMousePos(info);
        const midpoint = CalcSelectionsMidpoint(info, "world");

        const d = worldMousePos.sub(midpoint).len2();
        return (ROTATION_CIRCLE_R1 <= d && d <= ROTATION_CIRCLE_R2)
    }

    return {
        shouldActivate(event: InputManagerEvent, info: CircuitInfo): boolean {
            const { input, circuit, selections, locked } = info;
            if (locked)
                return false;
            // Activate if the user pressed their mouse or finger down
            //  over the "rotation circle" which only appears if
            //  there are Components being selected
            return (event.type === "mousedown" &&
                    input.getTouchCount() === 1 &&
                    selections.amount() > 0 &&
                    selections.all((s) => (circuit.getObj(s)!.baseKind === "Component")) &&
                    isMouseOnCircle(info));
        },
        shouldDeactivate(event: InputManagerEvent, {}: CircuitInfo): boolean {
            // Deactivate only mouse release
            return (event.type === "mouseup");
        },

        onActivate({}: InputManagerEvent, info: CircuitInfo): void {
            const { circuit, selections } = info;

            const worldMousePos = CalcWorldMousePos(info);
            const components = selections.get().map((id) => circuit.getObj(id)) as AnyComponent[];

            // Get initial component angles
            curAngles = components.map((c) => c.angle);
            curAroundAngle = 0;

            // Get initial overall angle
            startAngle = worldMousePos.sub(CalcSelectionsMidpoint(info, "world")).angle();
            prevAngle = startAngle;
        },
        onDeactivate({}: InputManagerEvent, { history }: CircuitInfo): void {
            if (!tempAction)
                return;

            history.add(tempAction);

            tempAction = undefined;
        },

        onEvent(event: InputManagerEvent, info: CircuitInfo): boolean {
            if (event.type !== "mousedrag")
                return false;

            const { circuit, input, selections } = info;

            tempAction?.undo();

            // Get whether z is presesed for independent rotation
            const isIndependent = input.isKeyDown("z");

            const worldMousePos = CalcWorldMousePos(info);
            const midpoint = CalcSelectionsMidpoint(info, "world");

            const components = selections.get().map((id) => circuit.getObj(id)) as AnyComponent[];

            const dAngle = worldMousePos.sub(midpoint).angle() - prevAngle;

            // Calculate new and snapped angles
            const newAngles = curAngles.map((a) => (a + dAngle));
            const snappedAngles = newAngles
                .map((a) => (
                    input.isShiftKeyDown()
                    ? (Math.floor(a/ROTATION_SNAP_AMT)*ROTATION_SNAP_AMT)
                    : a
                ));

            // Calculate new angle the rotation about the midpoint
            const newAroundAngle = (
                isIndependent
                ? curAroundAngle
                : curAroundAngle + dAngle
            );
            const snappedAroundAngle = (
                input.isShiftKeyDown()
                ? Math.floor(newAroundAngle/ROTATION_SNAP_AMT)*ROTATION_SNAP_AMT
                : newAroundAngle
            );

            // Calculate new, snapped positions
            const snappedPositions = components
                .map((c) => V(c.x, c.y))
                .map((v) => v.rotate(snappedAroundAngle, midpoint));

            tempAction = new GroupAction(
                selections.get().map((id, i) =>
                    SetTransform(circuit, id, snappedPositions[i], snappedAngles[i]))
            );

            curAngles = newAngles;
            curAroundAngle = newAroundAngle;

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
