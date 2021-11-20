import {Deserialize, Serialize} from "serialeazy";

import {V} from "Vector";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {AddGroupAction} from "core/actions/addition/AddGroupAction";
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

        // Check if any of the icData's are already within this circuit by comparing
        //  their serialized versions (fixes issue #712)
        const serializedICDatas = designer.getICData().map(d => Serialize(d));

        // Get indices of ICData that already exist (-1 if the ICData is new)
        const icDataIndices = icData
            .map(d => Serialize(d))
            .map(s => serializedICDatas.indexOf(s));

        // Filter out only the new ICData
        const newICData = icData.filter((_, i) => (icDataIndices[i] === -1));

        // Update ICs to use existing ICData if applicable
        ics.forEach(ic => {
            const dataIndex = icDataIndices[icData.indexOf(ic.getData())];
            if (dataIndex === -1)
                return; // Don't change IC since it uses the new Data
            // Change ICData to point to the existing ICData in the designer
            ic["data"] = designer.getICData()[icDataIndices[dataIndex]];
        });

        // Get all components
        const comps = objs.filter(o => o instanceof Component) as Component[];

        history.add(new GroupAction([
            new TransferICDataAction(newICData, designer),
            new AddGroupAction(designer, new IOObjectSet(objs)),
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
