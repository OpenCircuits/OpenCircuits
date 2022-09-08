import {Deserialize, Serialize} from "serialeazy";

import {V, Vector} from "Vector";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {AddGroup} from "core/actions/compositions/AddGroup";

import {DeselectAll, SelectGroup} from "core/actions/units/Select";
import {Translate}                from "core/actions/units/Translate";

import {Component, IOObject} from "core/models";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {AddICData} from "digital/actions/units/AddICData";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {IC} from "digital/models/ioobjects/other";


/**
 * Finds and adds any new IC data upon paste.
 *
 * @param objs     All objects in data.
 * @param designer Circuit designer.
 * @returns          GroupAction to add all relevant IC data.
 */
function TransferNewICData(objs: IOObject[], designer: DigitalCircuitDesigner): Action | undefined {
    // Find ICs and ICData
    const ics = objs.filter((o) => o instanceof IC) as IC[];
    const icData = [...new Set(ics.map((ic) => ic.getData()))]; // Get unique ICData

    // Check if any of the icData's are already within this circuit by comparing
    //  their serialized versions (fixes issue #712)
    const serializedICDatas = designer.getICData().map((d) => Serialize(d));

    // Get indices of ICData that already exist (-1 if the ICData is new)
    const icDataIndices = icData
        .map((d) => Serialize(d))
        .map((s) => serializedICDatas.indexOf(s));

    // Filter out only the new ICData
    const newICData = icData.filter((_, i) => (icDataIndices[i] === -1));

    // Update ICs to use existing ICData if applicable
    ics.forEach((ic) => {
        const dataIndex = icDataIndices[icData.indexOf(ic.getData())];
        if (dataIndex === -1)
            return; // Don't change IC since it uses the new Data
        // Change ICData to point to the existing ICData in the designer
        ic.setData(designer.getICData()[dataIndex]);
    });

    // Transfer the new ICData
    const action = new GroupAction(
        newICData
            // Filter out ICData that we already have
            .filter((data) => !designer.getICData().includes(data))
            .map((data) => AddICData(data, designer)),
    "Transfer ICData");

    // Recursively look through all the new ICs for new ICData
    newICData.forEach((d) => {
        const newAction = TransferNewICData(d.getGroup().toList(), designer);
        if (newAction)
            action.add(newAction)
    });

    return action;
}

/**
 * Performs paste action in Digital Circuit.
 *
 * @param data    Clipboard data.
 * @param info    Circuit info.
 * @param menuPos Top left of context menu if being pasted using context menu.
 * @returns         True if successful paste.
 */
export function DigitalPaste(data: string, info: DigitalCircuitInfo, menuPos?: Vector): boolean {
    try {
        const { history, designer, selections, renderer } = info;
        const objs = Deserialize<IOObject[]>(data);

        const newICDataAction = TransferNewICData(objs, designer);

        // Get all components
        const comps = objs.filter((o) => o instanceof Component) as Component[];

        // Determine shift for target positions for pasted components
        const targetPosShift = menuPos?.sub(comps[0].getPos()) ?? V(5, 5);

        // Create action to transfer the ICData, add the objects, select them, and offset them slightly
        const action = new GroupAction([], "Digital Paste");
        if (newICDataAction)
            action.add(newICDataAction);
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
