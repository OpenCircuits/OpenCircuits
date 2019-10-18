import {CreateComponentFromXML} from "analog/utils/ComponentFactory";
import {AnalogWiringTool} from "analog/tools/AnalogWiringTool";
import {AnalogCircuitDesigner} from "analog/models/AnalogCircuitDesigner";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {ContextMenuController} from "site/shared/controllers/ContextMenuController";
import {LoginController} from "site/shared/controllers/LoginController";
import {SideNavController} from "site/shared/controllers/SideNavController";

import {TitlePopupModule}    from "site/shared/selectionpopup/TitlePopupModule";
import {PositionPopupModule} from "site/shared/selectionpopup/PositionPopupModule";

import {MainDesignerView} from "site/analog/views/MainDesignerView";
import {SplitWireTool} from "core/tools/SplitWireTool";

export class AnalogCircuitController extends MainDesignerController {
    private contextMenu: ContextMenuController;
    private sideNav: SideNavController;
    private loginController: LoginController;

    protected designer: AnalogCircuitDesigner;

    public constructor() {
        super(new AnalogCircuitDesigner(() => this.render()),
              new MainDesignerView(),
              CreateComponentFromXML);

        this.toolManager.addTools(new AnalogWiringTool(this.designer, this.getCamera()),
                                  new SplitWireTool(this.getCamera()));

        this.selectionPopup.addModules(
            new TitlePopupModule(this),
            new PositionPopupModule(this)
        );

        this.contextMenu = new ContextMenuController(this);
        this.sideNav = new SideNavController(this);

        this.loginController = new LoginController(this, this.sideNav);
    }

    public async init(): Promise<void> {
        return await this.loginController.initAuthentication();
    }

    public loadCircuit(_contents: XMLDocument): void {
        // const name = Importer.PromptLoadCircuit(this.getDesigner(), contents);
        // this.headerController.setProjectName(name);
    }

    public saveCircuit(): string {
        return "AAAA";
        // const circuit = this.getDesigner();
        // return Exporter.WriteCircuit(circuit, this.headerController.getProjectName());
    }

    public getDesigner(): AnalogCircuitDesigner {
        return this.designer;
    }

}
