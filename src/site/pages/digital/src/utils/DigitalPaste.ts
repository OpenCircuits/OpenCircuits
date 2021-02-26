import {GroupAction} from "core/actions/GroupAction";
import {Component, IOObject} from "core/models";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {IOObjectSet} from "core/utils/ComponentUtils";
import {TransferICDataAction} from "digital/actions/TransferICDataAction";
import {IC} from "digital/models/ioobjects";
import {Deserialize} from "serialeazy";
import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {CreateDeselectAllAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {V} from "Vector";


export function DigitalPaste(data: string, {history, designer, selections, renderer}: DigitalCircuitInfo): boolean {
    try {
        const objs = Deserialize<IOObject[]>(data);

        // Find ICs and ICData
        const ics = objs.filter(o => o instanceof IC) as IC[];
        const icData = [...new Set(ics.map(ic => ic.getData()))]; // Get unique ICData

        // Get all components
        const comps = objs.filter(o => o instanceof Component) as Component[];

        history.add(new GroupAction([
            new TransferICDataAction(icData, designer),
            CreateAddGroupAction(designer, new IOObjectSet(comps)),
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
