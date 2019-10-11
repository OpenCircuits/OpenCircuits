import {V} from "Vector";

import {Exporter} from "core/utils/io/Exporter";
import {Importer} from "core/utils/io/Importer";
import {CopyGroup} from "digital/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";
import {CreateGroupTranslateAction} from "core/actions/transform/TranslateAction";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";
import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {TransferICDataAction} from "digital/actions/TransferICDataAction";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {IOObject} from "core/models/IOObject";
import {IC} from "digital/models/ioobjects/other/IC";

import {MainDesignerController} from "../../shared/controllers/MainDesignerController";

export class CopyController {
    private isAct

    public constructor(main: MainDesignerController) {
        document.addEventListener("copy",  (e) => this.onCopy(e, main),  false);
        document.addEventListener("cut",   (e) => this.onCut(e, main),   false);
        document.addEventListener("paste", (e) => this.onPaste(e, main), false);
    }

    private isActive(main: MainDesignerController): boolean {
        // Only paste if main designer is active and
        //  current tool is SelectionTool
        return main.isActive() && main.getCurrentTool() == main.getSelectionTool();
    }
    
    private onCopy(e: ClipboardEvent, main: MainDesignerController): void {
        if (!this.isActive(main))
            return;

        const selections = main.getSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as IOObject[];

        // Create sub-circuit with just selections to save
        const designer = new DigitalCircuitDesigner(-1);
        designer.addGroup(CopyGroup(objs));


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

    private onCut(e: ClipboardEvent, main: MainDesignerController): void {
        if (!this.isActive(main))
            return;

        const selections = main.getSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as Array<IOObject>;

        this.onCopy(e, main);

        // Delete the selections
        main.addAction(CreateDeselectAllAction(main.getSelectionTool()).execute());
        main.addAction(CreateDeleteGroupAction(objs).execute());
    }

    private onPaste(e: ClipboardEvent, main: MainDesignerController): void {
        if (!this.isActive(main))
            return;

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
