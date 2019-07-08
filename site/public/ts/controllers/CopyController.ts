import {Exporter} from "../utils/io/Exporter";
import {Importer} from "../utils/io/Importer";
import {CopyGroup} from "../utils/ComponentUtils";

import {CreateDeleteGroupAction} from "../utils/actions/deletion/DeleteGroupActionFactory";
import {CreateAddGroupAction} from "../utils/actions/addition/AddGroupActionFactory";
import {TranslateAction} from "../utils/actions/transform/TranslateAction";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {IC} from "../models/ioobjects/other/IC";

import {MainDesignerController} from "./MainDesignerController";

export const CopyController = (() => {
    const copy = function(e: ClipboardEvent): void {
        const selections = MainDesignerController.GetSelections();

        // Create sub-circuit with just selections to save
        const designer = new CircuitDesigner(-1);
        designer.addGroup(CopyGroup(selections));


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

        copy(e);

        // Delete the selections
        MainDesignerController.AddAction(
            CreateDeleteGroupAction(selections).execute()
        );
    }

    const paste = function(e: ClipboardEvent): void {
        const mainDesigner = MainDesignerController.GetDesigner();
        const contents = e.clipboardData.getData("text/xml");

        const designer = new CircuitDesigner(-1);
        Importer.read(designer, contents);

        const group = CopyGroup(designer.getGroup());

        const action = CreateAddGroupAction(mainDesigner, group);
        // action.add()

        MainDesignerController.AddAction(action.execute());
    }

    return {
        Init: function(): void {
            document.addEventListener('copy',  (e) => {copy(e)},  false);
            document.addEventListener('cut',   (e) => {cut(e)},   false);
            document.addEventListener('paste', (e) => {paste(e)}, false);
        }
    }
} )();
