import {ComponentInfoImpl} from "core/public/api/impl/ComponentInfo";

import {DigitalComponentInfo} from "../DigitalComponentInfo";
import {DigitalPortConfig}    from "../DigitalPortConfig";

import {DigitalPortConfigImpl} from "./DigitalPortConfig";


export class DigitalComponentInfoImpl extends ComponentInfoImpl implements DigitalComponentInfo {

    public override get defaultPortConfig(): DigitalPortConfig {
        return new DigitalPortConfigImpl(this.state, this.kind, this.info.defaultPortConfig);
    }

    public isInputPortGroup(group: string): boolean {
        throw new Error("Method not implemented.");
    }
    public isOutputPortGroup(group: string): boolean {
        throw new Error("Method not implemented.");
    }
}
