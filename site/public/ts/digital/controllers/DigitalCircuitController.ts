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

import {ICDesignerController} from "./ICDesignerController";
import {ContextMenuController} from "../../shared/controllers/ContextMenuController";
import {DigitalCopyController} from "./DigitalCopyController";

import {LoginController} from "site/shared/controllers/LoginController";
import {SideNavController} from "site/shared/controllers/SideNavController";

import {SplitWireTool} from "core/tools/SplitWireTool";
import {DigitalWiringTool} from "digital/tools/DigitalWiringTool";
import {ICViewerButtonPopupModule} from "./selectionpopup/ViewICButtonPopupModule";
import {ICViewerController} from "./ICViewerController";
import {IC} from "digital/models/ioobjects/other/IC";
import {LEFT_MOUSE_BUTTON} from "core/utils/Constants";
import {SegmentCountPopupModule} from "./selectionpopup/SegmentCountPopupModule";

import {ThumbnailGenerator} from "site/shared/utils/ThumbnailGenerator";
import {DigitalCircuitView} from "../views/DigitalCircuitView";
import {DigitalItemNavController} from "./DigitalItemNavController";
import {CircuitMetadata} from "core/models/CircuitMetadata";
import {VersionConflictResolver} from "../utils/DigitalVersionConflictResolver";

export class DigitalCircuitController extends MainDesignerController {
    private icController: ICDesignerController;
    private icViewer: ICViewerController;
    private contextMenu: ContextMenuController;
    private copyController: DigitalCopyController;
    private sideNav: SideNavController;
    private loginController: LoginController;

    protected designer: DigitalCircuitDesigner;
    protected itemNav: DigitalItemNavController;

    public constructor() {
        super(new DigitalCircuitDesigner(1, () => this.render()),
              new MainDesignerView(),
              new ThumbnailGenerator(DigitalCircuitView));

        this.itemNav = new DigitalItemNavController(this);

        this.toolManager.addTools(new DigitalWiringTool(this.designer, this.getCamera()),
                                  new SplitWireTool(this.getCamera()));

        this.icController = new ICDesignerController(this);
        this.icViewer = new ICViewerController(this);

        this.selectionPopup.addModules(
            new TitlePopupModule(this),
            new PositionPopupModule(this),
            new ColorPopupModule(this),
            new InputCountPopupModule(this),
            new OutputCountPopupModule(this),
            new ClockFrequencyPopupModule(this),
            new ICButtonPopupModule(this, this.icController),
            new ICViewerButtonPopupModule(this, this.icViewer),
            new BusButtonPopupModule(this),
            new SegmentCountPopupModule(this),
        );

        this.copyController = new DigitalCopyController(this);
        this.contextMenu = new ContextMenuController(this);
        this.sideNav = new SideNavController(this, this.headerController);

        this.loginController = new LoginController(this, this.sideNav);
    }

    public async init(): Promise<void> {
        return await this.loginController.initAuthentication();
    }

    public loadCircuit(contents: string): CircuitMetadata {
        VersionConflictResolver(contents);

        const metadata = super.loadCircuit(contents);

        this.itemNav.updateICSection(this.getDesigner().getICData());

        return metadata;
    }

    public updateICs(): void {
        this.itemNav.updateICSection(this.getDesigner().getICData());
    }

    public getCopyController(): DigitalCopyController {
        return this.copyController;
    }

    public getDesigner(): DigitalCircuitDesigner {
        return this.designer;
    }

    public onDoubleClick(button: number): boolean {
        const render = super.onDoubleClick(button);

        if (button !== LEFT_MOUSE_BUTTON)
            return render;

        const worldMousePos = this.getCamera().getWorldPos(this.input.getMousePos());

        const objs = this.designer.getObjects().reverse();
        const ics = objs.filter(c => c instanceof IC) as IC[];

        // Check if an IC was clicked
        const ic = ics.find(o => o.isWithinSelectBounds(worldMousePos));

        // Open up that IC
        if (ic) {
            this.icViewer.show(ic);
            return true;
        }

        return render;
    }
}
