import {ComponentInfoImpl} from "shared/api/circuit/public/impl/ComponentInfo";

import {DigitalComponentConfigurationInfo} from "digital/api/circuit/internal/DigitalComponents";

import {DigitalComponentInfo} from "../DigitalComponentInfo";

import {DigitalTypes} from "./DigitalCircuitContext";


export class DigitalComponentInfoImpl extends ComponentInfoImpl<DigitalTypes> implements DigitalComponentInfo {
    protected override getInfo() {
        const info = super.getInfo();
        if (!(info instanceof DigitalComponentConfigurationInfo))
            throw new Error(`Received non-digital component info for ${this.kind}!`);
        return info;
    }

    public get inputPortGroups(): readonly string[] {
        return this.getInfo().inputPortGroups;
    }
    public get outputPortGroups(): readonly string[] {
        return this.getInfo().outputPortGroups;
    }
}
