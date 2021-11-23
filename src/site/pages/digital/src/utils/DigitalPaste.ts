import {Deserialize} from "serialeazy";

import {V, Vector} from "Vector";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {AddGroupAction} from "core/actions/addition/AddGroupAction";
import {CreateDeselectAllAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";

import {Component, IOObject} from "core/models";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {TransferICDataAction} from "digital/actions/TransferICDataAction";
import {IC} from "digital/models/ioobjects";

/**
 * Maps positions of pasted components based around intially selected item
 * @param comps components in clipboard
 * @param info circuit info from which to pull camera and input
 * @returns target positions for pasting at mouse pos
 */
function shiftAllObj(comps: Component[], info: DigitalCircuitInfo): Vector[] {
    const {camera, input} = info;
    let worldMousePos = camera.getWorldPos(input.getMousePos());
    let shift = comps[0].getPos().sub(worldMousePos);
    return comps.map(o => o.getPos().sub(shift))
}

/**
 * 
 * @param data clipboard data
 * @param info circuit info
 * @param mouse true if being pasted using right click menu
 * @returns true if successful paste
 */
export function DigitalPaste(data: string, info: DigitalCircuitInfo, mouse: boolean): boolean {
    try {
        const {history, designer, selections, renderer} = info;
        const objs = Deserialize<IOObject[]>(data);

        // Find ICs and ICData
        const ics = objs.filter(o => o instanceof IC) as IC[];
        const icData = [...new Set(ics.map(ic => ic.getData()))]; // Get unique ICData
        // TODO: Check if any of the ICData's are identical to existing ICData's
        //  cause right now copy/pasting an IC w/in same circuit duplicates the ICData

        // Get all components
        const comps = objs.filter(o => o instanceof Component) as Component[];

        let targetPositions = mouse ?
            shiftAllObj(comps, info) :
            comps.map(o => o.getPos().add(V(5, 5)));

        history.add(new GroupAction([
            new TransferICDataAction(icData, designer),
            new AddGroupAction(designer, new IOObjectSet(objs)),
            CreateDeselectAllAction(selections),
            CreateGroupSelectAction(selections, comps),
            new TranslateAction(comps, comps.map(o => o.getPos()), targetPositions)
        ]).execute());

        renderer.render();

        return true;
    } catch (_) {
        return false;
    }
}
