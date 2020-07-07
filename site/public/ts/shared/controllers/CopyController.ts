import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {IOObject} from "core/models/IOObject";

import {MainDesignerController} from "./MainDesignerController";

export abstract class CopyController {

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

    public abstract copy(main: MainDesignerController): string;
    public abstract paste(data: string, main: MainDesignerController): void;

    private onCopy(e: ClipboardEvent, main: MainDesignerController): void {
        if (!this.isActive(main))
            return;

        // Export the circuit as XML and put it in the clipboard
        e.clipboardData.setData("text/json", this.copy(main));
        e.preventDefault();
    }

    private onCut(e: ClipboardEvent, main: MainDesignerController): void {
        if (!this.isActive(main))
            return;

        const selections = main.getSelections();
        const objs = selections.filter((o) => o instanceof IOObject) as IOObject[];

        this.onCopy(e, main);

        // Delete the selections
        main.addAction(CreateDeselectAllAction(main.getSelectionTool()).execute());
        main.addAction(CreateDeleteGroupAction(objs).execute());

        main.render();
    }

    private onPaste(e: ClipboardEvent, main: MainDesignerController): void {
        if (!this.isActive(main))
            return;


        // Load clipboard
        const data = e.clipboardData.getData("text/json") ||
                     e.clipboardData.getData("text/plain");
        this.paste(data, main);
    }

}
