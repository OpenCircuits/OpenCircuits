import {V} from "Vector";
import {IOObjectSet, SerializeForCopy} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {TransferICDataAction} from "digital/actions/TransferICDataAction";

import {IOObject} from "core/models/IOObject";
import {IC} from "digital/models/ioobjects/other/IC";

import {CopyController} from "../../shared/controllers/CopyController";
import {DigitalCircuitController} from "./DigitalCircuitController";
import {Deserialize} from "serialeazy";
import {Component} from "core/models/Component";

export class DigitalCopyController extends CopyController {

    public constructor(main: DigitalCircuitController) {
        super(main);
    }

    public copy(main: DigitalCircuitController): string {
        const selections = main.getSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as IOObject[];

        return SerializeForCopy(objs);
    }

    public paste(data: string, main: DigitalCircuitController): void {
        const objs = Deserialize<IOObject[]>(data);

        const mainDesigner = main.getDesigner();

        // Find ICs and ICData
        const ics = objs.filter((obj) => obj instanceof IC) as IC[];
        const icData = [...new Set(ics.map((ic) => ic.getData()))]; // Get unique ICData

        // Get all components
        const components = objs.filter((obj) => obj instanceof Component) as Component[];
        const action = new GroupAction();

        // Transfer the IC data over
        action.add(new TransferICDataAction(icData, mainDesigner));

        // Add each wire and object
        action.add(CreateAddGroupAction(mainDesigner, new IOObjectSet(objs)));

        // Deselect current selections, then select new objs
        action.add(CreateDeselectAllAction(main.getSelectionTool()));
        action.add(CreateGroupSelectAction(main.getSelectionTool(), components));

        // Translate the copies over a bit
        action.add(new TranslateAction(components, components.map(o => o.getPos().add(V(5, 5)))));

        main.addAction(action.execute());
        main.render();
    }

}
