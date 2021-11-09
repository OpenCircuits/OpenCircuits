import {GRID_SIZE,
        SPACEBAR_KEY,
        LEFT_MOUSE_BUTTON}  from "core/utils/Constants";
import {V, Vector} from "Vector";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {CopyGroupAction} from "core/actions/CopyGroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {Tool}            from "core/tools/Tool";

import {Component} from "core/models";
import {Action} from "core/actions/Action";
import {ShiftAction} from "core/actions/ShiftAction";
import {GroupAction} from "core/actions/GroupAction";


export const TranslateTool: Tool = (() => {
    let initalPositions = [] as Vector[];
    let components = [] as Component[];
    let worldMouseDownPos = V();
    let action: GroupAction;

    function snap(p: Vector): Vector {
        return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
                 Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
    }

    return {
        shouldActivate(event: Event, {locked, currentlyPressedObject}: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user is pressing down on an object
            return (event.type === "mousedrag" && event.button === LEFT_MOUSE_BUTTON &&
                    currentlyPressedObject instanceof Component);
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate by releasing mouse
            return (event.type === "mouseup" && event.button === LEFT_MOUSE_BUTTON);
        },


        onActivate(event: Event, info: CircuitInfo): void {
            const {camera, input, selections, currentlyPressedObject, designer} = info;

            worldMouseDownPos = camera.getWorldPos(input.getMouseDownPos());

            // If the pressed objecet is part of the selected objects,
            //  then translate all of the selected objects
            //  otherwise, just translate the pressed object
            components = (
                selections.has(currentlyPressedObject) ?
                        selections.get().filter(s => s instanceof Component) :
                        [currentlyPressedObject]
            ) as Component[];

            action = new GroupAction([
                new GroupAction(components.map(c => new ShiftAction(designer, c))).execute()
            ]);

            initalPositions = components.map(o => o.getPos());

            // explicitly start a drag
            this.onEvent(event, info);
        },
        onDeactivate({}: Event, {history}: CircuitInfo): void {
            const finalPositions = components.map(o => o.getPos());

            history.add(
                action.add(new TranslateAction(components, initalPositions, finalPositions))
            );
        },


        onEvent(event: Event, info: CircuitInfo): boolean {
            const {input, camera, history, designer} = info;

            switch (event.type) {
                // Using mousemove instead of mousedrag here because when a button besides
                //  mouse left is released, mousedrag events are no longer created, only mousemove.
                //  So instead mousemove is used and whether or not left mouse is still pressed is
                //  handled within the activation and deactivation of this tool.
                case "mousemove":
                    const worldMousePos = camera.getWorldPos(input.getMousePos());

                    const dPos = worldMousePos.sub(worldMouseDownPos);

                    // Calculate new positions
                    const curPositions = initalPositions.map(p => p.add(dPos));

                    // Get snapped positions if shift is held
                    const newPositions = input.isShiftKeyDown() ?
                        curPositions.map(p => snap(p)):
                        curPositions;

                    // Execute translate but don't save to group
                    //  action since we do that onDeactivate
                    new TranslateAction(components, initalPositions, newPositions).execute();

                    return true;

                case "keyup":
                    // Duplicate group when we press the spacebar
                    if (event.key === SPACEBAR_KEY) {
                        history.add(new CopyGroupAction(designer, components).execute());
                        return true;
                    }
                    break;
            }
            return false;
        }
    }
})();
