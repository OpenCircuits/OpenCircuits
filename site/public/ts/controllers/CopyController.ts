import {ToolManager} from "../utils/tools/ToolManager";
import {Exporter} from "../utils/io/Exporter";
import {Importer} from "../utils/io/Importer";
import {CopyGroup} from "../utils/ComponentUtils";
import {CircuitDesigner} from "../models/CircuitDesigner";
import {CLIPBOARD, setCLIPBOARD} from "../utils/Config";
import { Component } from "../models/ioobjects/Component";

// called in main.ts

// add the action to the maindesigncontroller.add action
// try looking at add objects in the main design controller

export const CopyController = (function() {
    let toolManager: ToolManager;
    let circuitDesigner: CircuitDesigner;

    const copy = function(e: ClipboardEvent) {
        let selectionTool = toolManager.getSelectionTool();
        let selections = selectionTool.getSelections();

        // create mini circuit designer with all components to copy
        //  and use exporter to write circuit to XML
        circuitDesigner.addGroup(CopyGroup(selections));
        let circuitString = Exporter.write(circuitDesigner, "miniCircuitDesigner");
        setCLIPBOARD(circuitString);

        // where do i find the ic data for the items?
        //circuitDesigner.addICData();

    }

    const cut = function(e: ClipboardEvent) {
        let selectionTool = toolManager.getSelectionTool();
        let selections = selectionTool.getSelections();

        copy(e);

        // delete selected components
        for(let s of selections){
            if(s instanceof Component){
                circuitDesigner.removeObject(s);
            }
        }
    }

    const paste = function(e: ClipboardEvent) {
        //what exactly does read do? it read an xml and laods it?
        //what is the last parameter?
        // TODO: Make sure this is an undoable/redoable action?
        Importer.read(circuitDesigner, CLIPBOARD, (n) => {});
    }

    return {
        Init: function(): void {
            document.addEventListener('copy', e => {copy(e)}, false);
            document.addEventListener('cut', e => {cut(e)}, false);
            document.addEventListener('paste', e => {paste(e)}, false);
        }
    }
} )();
