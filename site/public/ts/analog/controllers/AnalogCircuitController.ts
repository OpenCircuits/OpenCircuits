import {AnalogWiringTool} from "analog/tools/AnalogWiringTool";
import {AnalogCircuitDesigner} from "analog/models/AnalogCircuitDesigner";

import {SplitWireTool} from "core/tools/SplitWireTool";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {ContextMenuController} from "site/shared/controllers/ContextMenuController";
import {ItemNavController} from "site/shared/controllers/ItemNavController";

import {TitlePopupModule}    from "site/shared/selectionpopup/TitlePopupModule";
import {PositionPopupModule} from "site/shared/selectionpopup/PositionPopupModule";

import {MainDesignerView} from "site/analog/views/MainDesignerView";
import {ThumbnailGenerator} from "site/shared/utils/ThumbnailGenerator";
import {CopyController} from "site/shared/controllers/CopyController";
import {AnalogCircuitView} from "../views/AnalogCircuitView";

export class AnalogCircuitController extends MainDesignerController {
    private contextMenu: ContextMenuController;

    protected designer: AnalogCircuitDesigner;

    public constructor() {
        super(new AnalogCircuitDesigner(() => this.render()),
              new MainDesignerView(),
              new ThumbnailGenerator(AnalogCircuitView));

        this.itemNav = new ItemNavController(this);

        this.toolManager.addTools(new AnalogWiringTool(this.designer, this.getCamera()),
                                  new SplitWireTool(this.getCamera()));

        this.selectionPopup.addModules(
            new TitlePopupModule(this),
            new PositionPopupModule(this)
        );

        this.contextMenu = new ContextMenuController(this);
    }

    public async init(): Promise<void> {
        return await this.loginController.initAuthentication();
    }

    public getCopyController(): CopyController {
        return undefined;
    }

    public getDesigner(): AnalogCircuitDesigner {
        return this.designer;
    }

    protected onKeyDown(key: number): boolean {
        if (super.onKeyDown(key)) {
            return true;
        }
        return false;
    }

}
