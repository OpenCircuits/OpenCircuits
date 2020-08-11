import $ from "jquery";

import { AnalogCircuitDesigner } from "analog/models/AnalogCircuitDesigner";

/**
* A popup that exposes certain properties of the selected components to the user
* ! Controls its own DOM element(s)
* TODO: use decorators or some other interface to determine what properties are available
*/
export class AnalogAnalysisController {
    private designer: AnalogCircuitDesigner;

    private div: JQuery<HTMLDivElement> = $("#analysis-window");
    private startButton: JQuery<HTMLElement> = $("#start-button");

    public constructor(designer: AnalogCircuitDesigner) {
        this.designer = designer;
        this.startButton.click(async () => {
            this.designer.startSimulation();
            });
    }

    public update(): void {
        
    }

    public show(): void {
        this.div.removeClass("invisible")
        this.div.focus();
    }

    public hide(): void {
        this.div.addClass("invisible");
    }
}
