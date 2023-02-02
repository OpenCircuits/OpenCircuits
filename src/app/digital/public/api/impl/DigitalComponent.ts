import {Port}          from "core/public";
import {ComponentImpl} from "core/public/api/impl/Component";

import {DigitalComponent}     from "../DigitalComponent";
import {DigitalComponentInfo} from "../DigitalComponentInfo";

import {DigitalCircuitState}      from "./DigitalCircuitState";
import {DigitalComponentInfoImpl} from "./DigitalComponentInfo";


export class DigitalComponentImpl extends ComponentImpl<DigitalCircuitState> implements DigitalComponent {

    public get info(): DigitalComponentInfo {
        return new DigitalComponentInfoImpl(this.circuit, this.kind);
    }

    public firstAvailable(group: string): Port | undefined {
        throw new Error("Method not implemented.");
    }

}
