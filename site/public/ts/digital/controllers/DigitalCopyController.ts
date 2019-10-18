import {V} from "Vector";

import {Exporter} from "core/utils/io/Exporter";
import {Importer} from "core/utils/io/Importer";
import {CopyGroup} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {CreateGroupTranslateAction} from "core/actions/transform/TranslateAction";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {TransferICDataAction} from "digital/actions/TransferICDataAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {IOObject} from "core/models/IOObject";
import {IC} from "digital/models/ioobjects/other/IC";

import {CopyController} from "../../shared/controllers/CopyController";
import {DigitalCircuitController} from "./DigitalCircuitController";
import { DigitalNode } from "digital/models/ioobjects/other/DigitalNode";
import { isNode } from "core/models/Node";

export class DigitalCopyController extends CopyController {

    public constructor(main: DigitalCircuitController) {
        super(main);
    }

    protected copy(e: ClipboardEvent, main: DigitalCircuitController): void {
        console.log("HERE");
        const selections = main.getSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as IOObject[];

        // Create sub-circuit with just selections to save
        const designer = new DigitalCircuitDesigner(-1);
        designer.addGroup(CopyGroup(objs));

        const objs2 = designer.getObjects();
        console.log(objs2);
        for (const obj of objs2) {
            if (isNode(obj)) {
                console.log(obj);
                console.log(obj.getConnections().length);
                console.log(designer.getWires().length);
                if ((obj.getConnections().length) < 2) {
                    designer.removeObject(obj);
                    if (designer.getWires().length == 1) {
                        designer.removeWire(designer.getWires()[0]);
                    }
                }
            }
        }



        // Add all necessary IC data
        const icDatas = selections.filter((o) => o instanceof IC)
                .map((o) => (o as IC).getData());

        // Add unique ICData to the circuit
        icDatas.forEach((data, i) => {
            if (icDatas.indexOf(data) == i) // If first one
                designer.addICData(data);
        });

        // Export the circuit as XML and put it in the clipboard
        e.clipboardData.setData("text/xml", Exporter.WriteCircuit(designer, "clipboard"));
        e.preventDefault();
    }

    protected paste(e: ClipboardEvent, main: DigitalCircuitController): void{
        const mainDesigner = main.getDesigner();
        const contents = e.clipboardData.getData("text/xml");

        const designer = new DigitalCircuitDesigner(-1);
        Importer.LoadCircuit(designer, contents);

        const group = CopyGroup(designer.getGroup());
        const objs = group.getComponents();

        const action = new GroupAction();

        // Transfer the IC data over
        action.add(new TransferICDataAction(designer, mainDesigner));

        // Add each wire and object
        action.add(CreateAddGroupAction(mainDesigner, group));

        // Deselect current selections, then select new objs
        action.add(CreateDeselectAllAction(main.getSelectionTool()));
        action.add(CreateGroupSelectAction(main.getSelectionTool(), objs));

        // Translate the copies over a bit
        action.add(CreateGroupTranslateAction(objs, objs.map((o) => o.getPos().add(V(5, 5)))));

        main.addAction(action.execute());
        main.render();
    }

}