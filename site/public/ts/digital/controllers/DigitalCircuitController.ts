import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {MainDesignerView} from "../views/MainDesignerView";

import {TitlePopupModule}          from "site/shared/selectionpopup/TitlePopupModule";
import {PositionPopupModule}       from "site/shared/selectionpopup/PositionPopupModule";
import {ICButtonPopupModule}       from "site/digital/controllers/selectionpopup/ICButtonPopupModule";
import {BusButtonPopupModule}      from "site/digital/controllers/selectionpopup/BusButtonPopupModule";
import {ColorPopupModule}          from "site/digital/controllers/selectionpopup/ColorPopupModule";
import {InputCountPopupModule}     from "site/digital/controllers/selectionpopup/InputCountPopupModule";
import {OutputCountPopupModule}    from "site/digital/controllers/selectionpopup/OutputCountPopupModule";
import {ClockFrequencyPopupModule} from "site/digital/controllers/selectionpopup/ClockFrequencyPopupModule";

import {CreateComponentFromXML} from "digital/utils/ComponentFactory";

import {ICDesignerController} from "./ICDesignerController";
import {ContextMenuController} from "../../shared/controllers/ContextMenuController";
import {DigitalCopyController} from "./DigitalCopyController";
import {DigitalHeaderController} from "./DigitalHeaderController";
import {Importer} from "core/utils/io/Importer";
import {Exporter} from "core/utils/io/Exporter";
import {LoginController} from "../../shared/controllers/LoginController";
import {SideNavController} from "../../shared/controllers/SideNavController";
import {DigitalWiringTool} from "digital/tools/DigitalWiringTool";

export class DigitalCircuitController extends MainDesignerController {
    private icController: ICDesignerController;
    private contextMenu: ContextMenuController;
    private copyController: DigitalCopyController;
    private headerController: DigitalHeaderController;
    private sideNav: SideNavController;
    private loginController: LoginController;

    protected designer: DigitalCircuitDesigner;

    public constructor() {
        super(new DigitalCircuitDesigner(1, () => this.render()),
              new MainDesignerView(),
              CreateComponentFromXML);

        this.toolManager.addTools(new DigitalWiringTool(this.designer, this.getCamera()));

        this.icController = new ICDesignerController(this);

        this.selectionPopup.addModules(
            new TitlePopupModule(this),
            new PositionPopupModule(this),
            new ColorPopupModule(this),
            new InputCountPopupModule(this),
            new OutputCountPopupModule(this),
            new ClockFrequencyPopupModule(this),
            new ICButtonPopupModule(this, this.icController),
            new BusButtonPopupModule(this)
        );

        this.contextMenu = new ContextMenuController(this);
        this.copyController = new DigitalCopyController(this);
        this.headerController = new DigitalHeaderController(this);
        this.sideNav = new SideNavController(this);

        this.loginController = new LoginController(this, this.sideNav);
    }

    public async init(): Promise<void> {
        return await this.loginController.initAuthentication();
    }

    public loadCircuit(contents: XMLDocument): void {
        const name = Importer.PromptLoadCircuit(this.getDesigner(), contents);
        this.headerController.setProjectName(name);
    }

    public saveCircuit(): string {
        const circuit = this.getDesigner();
        return Exporter.WriteCircuit(circuit, this.headerController.getProjectName());
    }

    public getDesigner(): DigitalCircuitDesigner {
        return this.designer;
    }

}