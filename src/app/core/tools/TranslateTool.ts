import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";

import {V} from "Vector";

import {CircuitInfo}                   from "core/utils/CircuitInfo";
import {CalcWorldMousePos}             from "core/utils/CircuitInfoUtils";
import {InputManagerEvent}             from "core/utils/InputManager";
import {SnapToConnections, SnapToGrid} from "core/utils/SnapUtils";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {SetPos} from "core/actions/compositions/SetTransform";

import {Tool} from "core/tools/Tool";

import {AnyComponent} from "core/models/types";

import {ShiftComponents} from "core/models/utils/ShiftComponent";


const ARROW_TRANSLATE_DISTANCE_NORMAL = 50;
const ARROW_TRANSLATE_DISTANCE_SMALL = 11;

export const TranslateTool: Tool = (() => {
    let components = [] as AnyComponent[];

    let worldMouseDownPos = V();

    let action: GroupAction;
    let activatedButton: string | number;

    let tempAction: Action | undefined;

    return {
        shouldActivate(event: InputManagerEvent, { locked, circuit, curPressedObjID, selections }: CircuitInfo): boolean {
            if (locked)
                return false;
            const curPressedObj = circuit.getObj(curPressedObjID ?? "");
            // Activate if the user is pressing down on an object or an arrow key
            return (
                (event.type === "mousedrag" && event.button === LEFT_MOUSE_BUTTON &&
                    curPressedObj?.baseKind === "Component") ||
                (event.type === "keydown" && (
                        event.key === "ArrowLeft" || event.key === "ArrowRight" ||
                        event.key === "ArrowUp"  || event.key === "ArrowDown"
                    ) && (
                        selections.get().length > 0 &&
                        selections.any((c) => (circuit.getObj(c)?.baseKind === "Component"))
                ))
            );
        },
        shouldDeactivate(event: InputManagerEvent, {}: CircuitInfo): boolean {
            // Deactivate by releasing mouse or an arrow key
            return (
                (event.type === "mouseup" && event.button === LEFT_MOUSE_BUTTON) ||
                (event.type === "keyup" && event.key === activatedButton && (
                        event.key === "ArrowLeft" || event.key === "ArrowRight" ||
                        event.key === "ArrowUp"   || event.key === "ArrowDown"
                ))
            );
        },


        onActivate(event: InputManagerEvent, info: CircuitInfo): void {
            const { camera, circuit, input, selections, curPressedObjID } = info;

            const curPressedObj = circuit.getObj(curPressedObjID ?? "") as AnyComponent;

            // The event that activates this will either be keydown or mousedrag, so
            //  we can save the key like this to use later
            activatedButton = (event.type === "keydown" ? event.key : LEFT_MOUSE_BUTTON);

            // Necessary because `input` is mildly bugged and doing any other click
            //  (right-click/middle-mouse) will reset where `getMouseDownPos` is
            worldMouseDownPos = camera.getWorldPos(input.getMouseDownPos());

            // If the pressed objecet is part of the selected objects,
            //  then translate all of the selected objects
            //  otherwise, just translate the pressed object
            components = (
                (!curPressedObjID || selections.has(curPressedObjID))
                ? selections.get()
                    .map((id) => circuit.getObj(id)!)
                    .filter((s) => (s.baseKind === "Component")) as AnyComponent[]
                : [curPressedObj!]
            );

            action = new GroupAction([
                ShiftComponents(info, components),
            ], "Translate Tool", components.map((c) => `Translated ${c.name}.`));

            // initalPositions = components.map((o) => o.getPos());

            // explicitly start a drag
            this.onEvent(event, info);
        },
        onDeactivate({}: InputManagerEvent, { history }: CircuitInfo): void {
            if (!tempAction)
                return;
            history.add(action.add(tempAction));
            tempAction = undefined;
        },


        onEvent(event: InputManagerEvent, info: CircuitInfo): boolean {
            const { camera, circuit, input } = info;

            switch (event.type) {
                // Using mousemove instead of mousedrag here because when a button besides
                //  mouse left is released, mousedrag events are no longer created, only mousemove.
                //  So instead mousemove is used and whether or not left mouse is still pressed is
                //  handled within the activation and deactivation of this tool.
                case "mousemove":
                    if (activatedButton !== LEFT_MOUSE_BUTTON)
                        break;

                    const worldMousePos = CalcWorldMousePos(info);

                    const dPos = worldMousePos.sub(worldMouseDownPos);

                    tempAction?.undo();

                    const snapToGrid = input.isShiftKeyDown();
                    const snapToConnections = !input.isShiftKeyDown();

                    // Execute translate but don't save to group
                    tempAction = new GroupAction(
                        components.map((c) => {
                            let newPos = V(c.x, c.y).add(dPos);
                            if (snapToGrid)
                                newPos = SnapToGrid(newPos);
                            if (snapToConnections)
                                newPos = SnapToConnections(circuit, newPos, circuit.getPortsFor(c));
                            // Very specifically Translate as we go
                            //  as to correctly apply `SnapToConnections`
                            return SetPos(circuit, c.id, newPos);
                        })
                    );

                    return true;

                case "keyup":
                    // // Duplicate group when we press the spacebar
                    // if (event.key === " ") {
                    //     const copies = CopyGroup(components);
                    //     history.add(AddGroup(designer, copies));
                    //     return true;
                    // }
                    break;

                case "keydown":
                    // TOOD: Consider moving to own tool (or Handler?)
                    // if (activatedButton === LEFT_MOUSE_BUTTON)
                    //     break;

                    // // Translate with the arrow keys
                    // let deltaPos = new Vector();

                    // // No else if because it introduces bugs when
                    // //  multiple arrow keys are pressed
                    // if (input.isKeyDown("ArrowLeft"))
                    //     deltaPos = deltaPos.add(-1, 0);
                    // if (input.isKeyDown("ArrowRight"))
                    //     deltaPos = deltaPos.add(1, 0);
                    // if (input.isKeyDown("ArrowUp"))
                    //     deltaPos = deltaPos.add(0, -1);
                    // if (input.isKeyDown("ArrowDown"))
                    //     deltaPos = deltaPos.add(0, 1);

                    // // Object gets moved different amounts depending on if the shift key is held
                    // const factor = (
                    //     input.isShiftKeyDown() ? ARROW_TRANSLATE_DISTANCE_SMALL : ARROW_TRANSLATE_DISTANCE_NORMAL
                    // );

                    // Translate(components, positions.map((p) => p.add(deltaPos.scale(factor))));

                    return true;
            }
            return false;
        },
    }
})();
