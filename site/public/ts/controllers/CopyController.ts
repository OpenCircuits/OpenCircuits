import {V} from "../utils/math/Vector";

import {Exporter} from "../utils/io/Exporter";
import {Importer} from "../utils/io/Importer";
import {CopyGroup} from "../utils/ComponentUtils";

import {GroupAction} from "../utils/actions/GroupAction";
import {CreateGroupTranslateAction} from "../utils/actions/transform/TranslateAction";
import {CreateGroupSelectAction,
        CreateDeselectAllAction} from "../utils/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "../utils/actions/deletion/DeleteGroupActionFactory";
import {CreateAddGroupAction} from "../utils/actions/addition/AddGroupActionFactory";
import {TransferICDataAction} from "../utils/actions/TransferICDataAction";

import {CircuitDesigner} from "../models/CircuitDesigner";
import {IOObject} from "../models/ioobjects/IOObject";
import {IC} from "../models/ioobjects/other/IC";

import {MainDesignerController} from "./MainDesignerController";

export const CopyController = (() => {
    const copy = function(e: ClipboardEvent): void {
        const selections = MainDesignerController.GetSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as Array<IOObject>;

        // Create sub-circuit with just selections to save
        const designer = new CircuitDesigner(-1);
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
        e.clipboardData.setData("text/xml", Exporter.write(designer, "clipboard"));
        e.preventDefault();
    }

    const cut = function(e: ClipboardEvent): void {
        const selections = MainDesignerController.GetSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as Array<IOObject>;

        copy(e);

        // Delete the selections
        MainDesignerController.AddAction(
            CreateDeleteGroupAction(MainDesignerController.GetSelectionTool(), objs).execute()
        );
    }

    const paste = function(e: ClipboardEvent): void {
        const mainDesigner = MainDesignerController.GetDesigner();
        const contents = e.clipboardData.getData("text/xml");

        const designer = new CircuitDesigner(-1);
        Importer.read(designer, contents);

        const group = CopyGroup(designer.getGroup());
        const objs = group.getAllComponents();

        const action = new GroupAction();

        // Transfer the IC data over
        action.add(new TransferICDataAction(designer, mainDesigner));

        // Add each wire and object
        action.add(CreateAddGroupAction(mainDesigner, group));

        // Deselect current selections
        action.add(CreateDeselectAllAction(MainDesignerController.GetSelectionTool()));

        // Select everything that was added
        action.add(CreateGroupSelectAction(MainDesignerController.GetSelectionTool(), objs));

        // Translate the copies over a bit
        action.add(CreateGroupTranslateAction(objs, objs.map((o) => o.getPos().add(V(5, 5)))));

        MainDesignerController.AddAction(action.execute());
        MainDesignerController.Render();
    }

    const isActive = function(): boolean {
        return MainDesignerController.IsActive() &&
                MainDesignerController.GetCurrentTool() == MainDesignerController.GetSelectionTool();
    }

    return {
        Init: function(): void {
            document.addEventListener('copy',  (e) => !isActive() || copy(e),  false);
            document.addEventListener('cut',   (e) => !isActive() || cut(e),   false);
            document.addEventListener('paste', (e) => !isActive() || paste(e), false);
        }
    }
} )();
