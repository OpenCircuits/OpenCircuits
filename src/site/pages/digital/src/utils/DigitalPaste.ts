import {Deserialize} from "serialeazy";

import {V} from "Vector";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {CreateDeselectAllAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";

import {Component, IOObject} from "core/models";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {TransferICDataAction} from "digital/actions/TransferICDataAction";
import {IC} from "digital/models/ioobjects";


export function DigitalPaste(data: string, {history, designer, selections, renderer}: DigitalCircuitInfo): boolean {
    try {
        const objs = Deserialize<IOObject[]>(data);

        // Find ICs and ICData
        const ics = objs.filter(o => o instanceof IC) as IC[];
        const icData = [...new Set(ics.map(ic => ic.getData()))]; // Get unique ICData
        // TODO: Check if any of the ICData's are identical to existing ICData's
        //  cause right now copy/pasting an IC w/in same circuit duplicates the ICData

        // Get all components
        const comps = objs.filter(o => o instanceof Component) as Component[];

        history.add(new GroupAction([
            new TransferICDataAction(icData, designer),
            CreateAddGroupAction(designer, new IOObjectSet(objs)),
            CreateDeselectAllAction(selections),
            CreateGroupSelectAction(selections, comps),
            new TranslateAction(comps, comps.map(o => o.getPos()), comps.map(o => o.getPos().add(V(5, 5))))
        ]).execute());

        renderer.render();

        return true;
    } catch (_) {
        return false;
    }
}
