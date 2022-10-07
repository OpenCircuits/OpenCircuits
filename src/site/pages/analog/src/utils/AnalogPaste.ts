import {Deserialize} from "serialeazy";

import {V, Vector} from "Vector";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";

import {AddGroup} from "core/actions/compositions/AddGroup";

import {DeselectAll, SelectGroup} from "core/actions/units/Select";
import {Translate}                from "core/actions/units/Translate";

import {Component, IOObject} from "core/models";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";


/**
 * Performs paste action in an Analog Circuit.
 *
 * @param data    Clipboard data.
 * @param info    Circuit info.
 * @param menuPos Top left of context menu if being pasted using context menu.
 * @returns         True if successful paste.
 */
export function AnalogPaste(data: string, info: AnalogCircuitInfo, menuPos?: Vector): boolean {
    try {
        const { history, designer, selections, renderer } = info;
        const objs = Deserialize<IOObject[]>(data);

        // Get all components
        const comps = objs.filter((o) => o instanceof Component) as Component[];

        // Determine shift for target positions for pasted components
        const targetPosShift = menuPos?.sub(comps[0].getPos()) ?? V(5, 5);

        // Create action to transfer the ICData, add the objects, select them, and offset them slightly
        const action = new GroupAction([], "Analog Paste");
        action.add(new GroupAction([
            AddGroup(designer, new IOObjectSet(objs)),
            DeselectAll(selections),
            SelectGroup(selections, comps),
            Translate(comps, comps.map((o) => o.getPos().add(targetPosShift))),
        ]));

        history.add(action);

        renderer.render();

        return true;
    } catch {
        return false;
    }
}
