import {AnalogWiringTool} from "analog/tools/AnalogWiringTool";
import {AnalogCircuitDesigner} from "analog/models/AnalogCircuitDesigner";

import {SplitWireTool} from "core/tools/SplitWireTool";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {ContextMenuController} from "site/shared/controllers/ContextMenuController";
import {LoginController} from "site/shared/controllers/LoginController";
import {SideNavController} from "site/shared/controllers/SideNavController";
import {ItemNavController} from "site/shared/controllers/ItemNavController";

import {TitlePopupModule}    from "site/shared/selectionpopup/TitlePopupModule";
import {PositionPopupModule} from "site/shared/selectionpopup/PositionPopupModule";
import {ResistancePopupModule} from "./selectionpopup/ResistancePopupModule";
import {VoltagePopupModule} from "./selectionpopup/VoltagePopupModule";
import {CapacitancePopupModule} from "./selectionpopup/CapacitancePopupModule";

import {MainDesignerView} from "site/analog/views/MainDesignerView";
import {ThumbnailGenerator} from "site/shared/utils/ThumbnailGenerator";
import {AnalogCircuitView} from "../views/AnalogCircuitView";

export class AnalogCircuitController extends MainDesignerController {
    private contextMenu: ContextMenuController;
    private sideNav: SideNavController;
    private loginController: LoginController;

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
            new PositionPopupModule(this),
            new ResistancePopupModule(this),
            new VoltagePopupModule(this),
            new CapacitancePopupModule(this)
        );

        this.contextMenu = new ContextMenuController(this);
        this.sideNav = new SideNavController(this, this.headerController);

        this.loginController = new LoginController(this, this.sideNav);
    }

    public async init(): Promise<void> {
        return await this.loginController.initAuthentication();
    }

    public getDesigner(): AnalogCircuitDesigner {
        return this.designer;
    }

}
