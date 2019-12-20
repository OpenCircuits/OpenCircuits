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

    protected abstract copy(e: ClipboardEvent, main: MainDesignerController): void;
    protected abstract paste(e: ClipboardEvent, main: MainDesignerController): void;

    private onCopy(e: ClipboardEvent, main: MainDesignerController): void {
        if (!this.isActive(main))
            return;

        this.copy(e, main);
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

        this.paste(e, main);
    }

}
