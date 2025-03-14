import {ComponentImpl} from "shared/api/circuit/public/impl/Component";

import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";

import {DigitalTypes} from "./DigitalCircuitState";


export class DigitalComponentImpl extends ComponentImpl<DigitalTypes> implements DigitalComponent {
    public get inputs(): DigitalPort[] {
        return this.allPorts.filter((p) => (p.isInputPort));
    }
    public get outputs(): DigitalPort[] {
        return this.allPorts.filter((p) => (p.isOutputPort));
    }
}
