import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {AnalogCircuitDesigner} from "analog/models/AnalogCircuitDesigner";
import {MainDesignerView} from "../views/MainDesignerView";

import {TitlePopupModule}          from "site/shared/selectionpopup/TitlePopupModule";
import {PositionPopupModule}       from "site/shared/selectionpopup/PositionPopupModule";

import {CreateComponentFromXML} from "analog/utils/ComponentFactory";

import {ContextMenuController} from "../../shared/controllers/ContextMenuController";
import {LoginController} from "../../shared/controllers/LoginController";
import {SideNavController} from "../../shared/controllers/SideNavController";

export class AnalogCircuitController extends MainDesignerController {
    private contextMenu: ContextMenuController;
    private sideNav: SideNavController;
    private loginController: LoginController;

    protected designer: AnalogCircuitDesigner;

    public constructor() {
        super(new AnalogCircuitDesigner(() => this.render()),
              new MainDesignerView(),
              CreateComponentFromXML);

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

    public loadCircuit(contents: XMLDocument): void {
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