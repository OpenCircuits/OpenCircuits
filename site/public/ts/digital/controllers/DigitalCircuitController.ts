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

export class DigitalCircuitController extends MainDesignerController {
    private selectionPopup: SelectionPopupController;

    public constructor() {
        super(new DigitalCircuitDesigner(1, () => this.render()),
              new MainDesignerView());

        this.selectionPopup = new SelectionPopupController(this.getCamera());
        this.selectionPopup.addModules(
            new TitlePopupModule(this),
            new PositionPopupModule(this),
            new ColorPopupModule(this),
            new InputCountPopupModule(this),
            new OutputCountPopupModule(this),
            new ClockFrequencyPopupModule(this),
            new ICButtonPopupModule(this),
            new BusButtonPopupModule(this)
        );
    }

}