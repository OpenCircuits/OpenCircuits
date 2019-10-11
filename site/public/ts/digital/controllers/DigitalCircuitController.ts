import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {MainDesignerView} from "../views/MainDesignerView";
import {SelectionPopupController} from "./SelectionPopupController";

import {TitlePopupModule}          from "site/digital/selectionpopup/TitlePopupModule";
import {PositionPopupModule}       from "site/digital/selectionpopup/PositionPopupModule";
import {ICButtonPopupModule}       from "site/digital/selectionpopup/ICButtonPopupModule";
import {BusButtonPopupModule}      from "site/digital/selectionpopup/BusButtonPopupModule";
import {ColorPopupModule}          from "site/digital/selectionpopup/ColorPopupModule";
import {InputCountPopupModule}     from "site/digital/selectionpopup/InputCountPopupModule";
import {OutputCountPopupModule}    from "site/digital/selectionpopup/OutputCountPopupModule";
import {ClockFrequencyPopupModule} from "site/digital/selectionpopup/ClockFrequencyPopupModule";

import {CreateComponentFromXML} from "digital/utils/ComponentFactory";

import {ICDesignerController} from "./ICDesignerController";
import {ContextMenuController} from "./ContextMenuController";
import {DigitalCopyController} from "./DigitalCopyController";
import {DigitalHeaderController} from "./DigitalHeaderController";
import {Importer} from "core/utils/io/Importer";
import {Exporter} from "core/utils/io/Exporter";
import {LoginController} from "./LoginController";
import {SideNavController} from "./SideNavController";

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