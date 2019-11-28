import {Importer} from "core/utils/io/Importer";
import {SaveFile} from "site/shared/utils/Exporter";

import {HeaderController} from "../../shared/controllers/HeaderController";
import {DigitalCircuitController} from "./DigitalCircuitController";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

export class DigitalHeaderController extends HeaderController {

    public constructor(main: DigitalCircuitController) {
        super(main);
    }

    protected async onLoadCircuit(main: DigitalCircuitController, file: File): Promise<string> {
        const circuit = await Importer.PromptLoadCircuitFromFile(file);
        console.log(circuit);
        main.setDesigner(circuit.getContents() as DigitalCircuitDesigner);
        return circuit.getMetadata().getName();
    }

    protected onSaveCircuit(main: DigitalCircuitController): void {
        SaveFile(main.getDesigner(), this.projectNameInput.val() as string, true);
    }

}
