import $ from "jquery";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";
import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";
import {IC} from "digital/models/ioobjects/other/IC";
import {ICViewerController} from "../ICViewerController";

export class ICViewerButtonPopupModule extends SelectionPopupModule {
    private ic: IC;
    private icViewer: ICViewerController;

    public constructor(circuitController: MainDesignerController, icViewer: ICViewerController) {
        // No wrapping div
        super(circuitController, $("button#popup-ic-viewer-button"));
        this.icViewer = icViewer;

        this.el.click(() => this.push());
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const icSelections = selections.filter(o => o instanceof IC) as IC[];
        if (icSelections.length != 1) {
            this.setEnabled(false);
            this.ic = null;
        } else {
            this.ic = icSelections[0];
            this.setEnabled(true);
        }
    }

    public push(): void {
        this.icViewer.show(this.ic);
    }
}
