import {GRID_SIZE,
        SPACEBAR_KEY}  from "core/utils/Constants";
import {V, Vector} from "Vector";

import {Event}       from "core/utils/Events";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {CopyGroupAction} from "core/actions/CopyGroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {Tool}            from "core/tools/Tool";

import {Component} from "core/models";


export const TranslateTool: Tool = (() => {
    let initalPositions = [] as Vector[];
    let components = [] as Component[];

    function snap(p: Vector): Vector {
        return V(Math.floor(p.x/GRID_SIZE + 0.5) * GRID_SIZE,
                 Math.floor(p.y/GRID_SIZE + 0.5) * GRID_SIZE);
    }

    return {
        shouldActivate(event: Event, {locked, currentlyPressedObject}: CircuitInfo): boolean {
            if (locked)
                return false;
            // Activate if the user is pressing down on an object
            return (event.type === "mousedrag" &&
                    currentlyPressedObject instanceof Component);
        },
        shouldDeactivate(event: Event, {}: CircuitInfo): boolean {
            // Deactivate by releasing mouse
            return (event.type === "mouseup");
        },


        onActivate(event: Event, info: CircuitInfo): void {
            const {selections, currentlyPressedObject} = info;

            // If the pressed objecet is part of the selected objects,
            //  then translate all of the selected objects
            //  otherwise, just translate the pressed object
            components = (
                selections.has(currentlyPressedObject) ?
                        selections.get().filter(s => s instanceof Component) :
                        [currentlyPressedObject]
            ) as Component[];

            initalPositions = components.map(o => o.getPos());

            // explicitly start a drag
            this.onEvent(event, info);
        },
        onDeactivate({}: Event, {history}: CircuitInfo): void {
            const finalPositions = components.map(o => o.getPos());
            history.add(new TranslateAction(components, initalPositions, finalPositions));
        },


        onEvent(event: Event, info: CircuitInfo): boolean {
            const {input, camera, history, designer} = info;

            switch (event.type) {
                case "mousedrag":
                    const worldMouseDownPos = camera.getWorldPos(input.getMouseDownPos());
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
