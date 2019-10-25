import {Importer} from "core/utils/io/Importer";
import {Exporter} from "core/utils/io/Exporter";

import {HeaderController} from "../../shared/controllers/HeaderController";
import {DigitalCircuitController} from "./DigitalCircuitController";

export class DigitalHeaderController extends HeaderController {

    public constructor(main: DigitalCircuitController) {
        super(main);
    }

    protected async onLoadCircuit(main: DigitalCircuitController, file: File): Promise<string> {
        return await Importer.PromptLoadCircuitFromFile(main.getDesigner(), file);
    }

    protected onSaveCircuit(main: DigitalCircuitController): void {
        Exporter.SaveFile(main.getDesigner(), this.projectNameInput.val() as string);
    }

}
