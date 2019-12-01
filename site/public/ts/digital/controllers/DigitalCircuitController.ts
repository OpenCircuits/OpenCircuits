import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {MainDesignerView} from "../views/MainDesignerView";

import {Importer} from "core/utils/io/Importer";
import {WriteCircuit} from "site/shared/utils/Exporter";

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

import {LoginController} from "site/shared/controllers/LoginController";
import {SideNavController} from "site/shared/controllers/SideNavController";

import {SplitWireTool} from "core/tools/SplitWireTool";
import {DigitalWiringTool} from "digital/tools/DigitalWiringTool";
import {SegmentCountPopupModule} from "./selectionpopup/SegmentCountPopupModule";

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


        this.toolManager.addTools(new DigitalWiringTool(this.designer, this.getCamera()),
                                  new SplitWireTool(this.getCamera()));

        this.icController = new ICDesignerController(this);

        this.selectionPopup.addModules(
            new TitlePopupModule(this),
            new PositionPopupModule(this),
            new ColorPopupModule(this),
            new InputCountPopupModule(this),
            new OutputCountPopupModule(this),
            new ClockFrequencyPopupModule(this),
            new ICButtonPopupModule(this, this.icController),
            new BusButtonPopupModule(this),
            new SegmentCountPopupModule(this)
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
        const name = Importer.PromptLoadCircuit(this.getDesigner(), contents, this.getCamera());
        this.headerController.setProjectName(name);
    }

    public saveCircuit(thumbnail: boolean = true): string {
        return WriteCircuit(this, this.headerController.getProjectName(), thumbnail);
    }

    public getDesigner(): DigitalCircuitDesigner {
        return this.designer;
    }

}
