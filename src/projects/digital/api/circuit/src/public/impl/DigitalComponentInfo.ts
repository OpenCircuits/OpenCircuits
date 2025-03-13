import {ErrE, Ok} from "shared/api/circuit/utils/Result";
import {AddErrE} from "shared/api/circuit/utils/MultiError";
import {ComponentInfoImpl} from "shared/api/circuit/public/impl/ComponentInfo";

import {DigitalComponentConfigurationInfo} from "digital/api/circuit/internal/DigitalComponents";

import {DigitalComponentInfo} from "../DigitalComponentInfo";

import {DigitalTypes} from "./DigitalCircuitState";


export class DigitalComponentInfoImpl extends ComponentInfoImpl<DigitalTypes> implements DigitalComponentInfo {
    protected override getInfo() {
        return this.state.internal.getComponentInfo(this.kind)
            .andThen<DigitalComponentConfigurationInfo>((info) => {
                if (!(info instanceof DigitalComponentConfigurationInfo))
                    return ErrE(`Received non-digital component info for ${this.kind}!`);
                return Ok(info);
            })
            .mapErr(AddErrE(`API ComponentInfo: Attempted to get info with kind '${this.kind}' that doesn't exist!`))
            .unwrap();
    }

    public get inputPortGroups(): readonly string[] {
        return this.getInfo().inputPortGroups;
    }
    public get outputPortGroups(): readonly string[] {
        return this.getInfo().outputPortGroups;
    }
}
