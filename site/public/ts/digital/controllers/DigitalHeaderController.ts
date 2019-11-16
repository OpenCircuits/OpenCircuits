import {Importer} from "core/utils/io/Importer";
import {SaveFile} from "site/shared/utils/Exporter";

import {HeaderController} from "../../shared/controllers/HeaderController";
import {DigitalCircuitController} from "./DigitalCircuitController";

export class DigitalHeaderController extends HeaderController {

    public constructor(main: DigitalCircuitController) {
        super(main);
    }

    protected async onLoadCircuit(main: DigitalCircuitController, file: File): Promise<string> {
        return await Importer.PromptLoadCircuitFromFile(main, file);
    }

    protected onSaveCircuit(main: DigitalCircuitController): void {
        SaveFile(main, this.projectNameInput.val() as string, true);
    }

}
