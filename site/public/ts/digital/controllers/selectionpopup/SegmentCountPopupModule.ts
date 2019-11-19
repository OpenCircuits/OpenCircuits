import $ from "jquery";

import {MainDesignerController} from "../../../shared/controllers/MainDesignerController";
import {SelectionPopupModule} from "../../../shared/selectionpopup/SelectionPopupModule";

import {LED} from "digital/models/ioobjects/outputs/LED";

import {GroupAction} from "core/actions/GroupAction";
import {ColorChangeAction} from "digital/actions/ColorChangeAction";
import { SegmentDisplay } from "digital/models/ioobjects/outputs/SegmentDisplay";
import { InputPortChangeAction } from "digital/actions/ports/InputPortChangeAction";

export class SegmentCountPopupModule extends SelectionPopupModule {
    private count: HTMLSelectElement;

    public constructor(circuitController: MainDesignerController) {
        // Title module does not have a wrapping div
        super(circuitController, $("div#popup-segment-count-text"));

        this.count = this.el.find("select#popup-segment-count")[0] as HTMLSelectElement;
        this.count.onchange = () => this.push();
    }

    public pull(): void {
        const selections = this.circuitController.getSelections();
        const segmentDisplays = selections.filter(o => o instanceof SegmentDisplay) as SegmentDisplay[];
        const enable = selections.length == segmentDisplays.length && segmentDisplays.length > 0;

        if (enable) {
            const segmentCount = segmentDisplays[0].getInputPorts().length;
            const same = segmentDisplays.every((segment) => segment.getInputPorts().length == segmentCount);

            this.count.value = same ? segmentCount + "" : "-";
        }

        this.setEnabled(enable);
    }

    public push(): void {
        const selections = this.circuitController.getSelections() as SegmentDisplay[];
        const targetCount = Number(this.count.value);

        this.circuitController.addAction(new GroupAction(
            selections.map(s => new InputPortChangeAction(s, targetCount))
        ).execute());

        this.circuitController.render();
    }
}
