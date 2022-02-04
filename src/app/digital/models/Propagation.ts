import {serializable} from "serialeazy";
import {DigitalComponent, DigitalWire} from "./index";


@serializable("Propagation")
export class Propagation {
    private receiver: DigitalComponent | DigitalWire;
    private signal: boolean;

    public constructor(receiver?: DigitalComponent | DigitalWire, signal?: boolean) {
        this.receiver = receiver!;
        this.signal = signal!;
    }

    public send(): void {
        this.receiver.activate(this.signal);
    }

}
