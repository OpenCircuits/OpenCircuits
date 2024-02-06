import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CircuitInfo}     from "core/utils/CircuitInfo";
import {CopyGroup, Snap} from "core/utils/ComponentUtils";
import {Event}           from "core/utils/Events";

import {GroupAction} from "core/actions/GroupAction";

import {AddGroup} from "core/actions/compositions/AddGroup";

import {Shift}     from "core/actions/units/Shift";
import {Translate} from "core/actions/units/Translate";

import {Tool} from "core/tools/Tool";

import {Component} from "core/models";


const ARROW_TRANSLATE_DISTANCE_NORMAL = 50;
const ARROW_TRANSLATE_DISTANCE_SMALL = 11;

export const TranslateTool: Tool = (() => {
    let initalPositions = [] as Vector[];
    let components = [] as Component[];
    let worldMouseDownPos = V();
    let action: GroupAction;
    let activatedButton: string | number;

    return {
        shouldActivate(event: Event, { locked, currentlyPressedObject, selections }: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user is pressing down on an object or an arrow key
            return (event.type === "mousedrag" && event.button === LEFT_MOUSE_BUTTON &&
                    currentlyPressedObject instanceof Component) ||
                   (event.type === "keydown" && (event.key === "ArrowLeft" || event.key === "ArrowRight" ||
                                                  event.key === "ArrowUp"  || event.key === "ArrowDown")
                                             && ((selections.any((c) => c instanceof Component) &&
                                                  selections.get().length > 0)));
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate by releasing mouse or an arrow key
            return (event.type === "mouseup" && event.button === LEFT_MOUSE_BUTTON) ||
            (event.type === "keyup" && event.key === activatedButton &&
                                       (event.key === "ArrowLeft" || event.key === "ArrowRight" ||
                                        event.key === "ArrowUp"   || event.key === "ArrowDown"));
        },


        onActivate(event: Event, info: CircuitInfo): void {
            const { camera, input, selections, currentlyPressedObject, designer } = info;

            // The event that activates this will either be keydown or mousedrag, so
            //  we can save the key like this to use later
            activatedButton = (event.type === "keydown" ? event.key : LEFT_MOUSE_BUTTON);

            worldMouseDownPos = camera.getWorldPos(input.getMouseDownPos());

            // If the pressed objecet is part of the selected objects,
            //  then translate all of the selected objects
            //  otherwise, just translate the pressed object
            components = (
                !currentlyPressedObject || selections.has(currentlyPressedObject) ?
                        selections.get().filter((s) => s instanceof Component) :
                        [currentlyPressedObject]
            ) as Component[];

            action = new GroupAction([
                new GroupAction(components.map((c) => Shift(designer, c)), "Shift Action"),
            ], "Translate Tool", components.map((c) => `Translated ${c.getName()}.`));

            initalPositions = components.map((o) => o.getPos());

            // explicitly start a drag
            this.onEvent(event, info);
        },
        onDeactivate({}: Event, { history }: CircuitInfo): void {
            const finalPositions = components.map((o) => o.getPos());

            // Translate back to original position, so that it undo's properly
            Translate(components, initalPositions);

            history.add(
                action.add(Translate(components, finalPositions))
            );
        },


        onEvent(event: Event, info: CircuitInfo): boolean {
            const { input, camera, history, designer } = info;

            switch (event.type) {
                // Using mousemove instead of mousedrag here because when a button besides
                //  mouse left is released, mousedrag events are no longer created, only mousemove.
                //  So instead mousemove is used and whether or not left mouse is still pressed is
                //  handled within the activation and deactivation of this tool.
                case "mousemove":
                    if (activatedButton !== LEFT_MOUSE_BUTTON)
                        break;

                    const worldMousePos = camera.getWorldPos(input.getMousePos());

                    const dPos = worldMousePos.sub(worldMouseDownPos);

                    // Calculate new positions
                    const curPositions = initalPositions.map((p) => p.add(dPos));

                    // Get snapped positions if shift is held
                    const newPositions = input.isShiftKeyDown() ?
                        curPositions.map((p) => Snap(p)):
                        curPositions;

                    const snapToConnections = input.isShiftKeyDown() ? false : true;
                    // Execute translate but don't save to group
                    Translate(components, newPositions, snapToConnections);

                    return true;

                case "keyup":
                    // Duplicate group when we press the spacebar
                    if (event.key === " ") {
                        const copies = CopyGroup(components);
                        history.add(AddGroup(designer, copies));
                        return true;
                    }
                    break;

                case "keydown":
                    if (activatedButton === LEFT_MOUSE_BUTTON)
                        break;

                    // Translate with the arrow keys
                    let deltaPos = new Vector();

                    // No else if because it introduces bugs when
                    //  multiple arrow keys are pressed
                    if (input.isKeyDown("ArrowLeft"))
                        deltaPos = deltaPos.add(-1, 0);
                    if (input.isKeyDown("ArrowRight"))
                        deltaPos = deltaPos.add(1, 0);
                    if (input.isKeyDown("ArrowUp"))
                        deltaPos = deltaPos.add(0, -1);
                    if (input.isKeyDown("ArrowDown"))
                        deltaPos = deltaPos.add(0, 1);

                    // Object gets moved different amounts depending on if the shift key is held
                    const factor = (
                        input.isShiftKeyDown() ? ARROW_TRANSLATE_DISTANCE_SMALL : ARROW_TRANSLATE_DISTANCE_NORMAL
                    );

                    Translate(components, initalPositions.map((p) => p.add(deltaPos.scale(factor))));

                    return true;
            }
            return false;
        },
    }
})();
