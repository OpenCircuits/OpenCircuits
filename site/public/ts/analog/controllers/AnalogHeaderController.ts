import {HeaderController} from "../../shared/controllers/HeaderController";
import {AnalogCircuitController} from "./AnalogCircuitController";

export class AnalogHeaderController extends HeaderController {

    public constructor(main: AnalogCircuitController) {
        super(main);
    }

    protected async onLoadCircuit(_main: AnalogCircuitController, _file: File): Promise<string> {
        return new Promise(resolve => resolve(""));
    }

    protected onSaveCircuit(_main: AnalogCircuitController): void {
    }

}
