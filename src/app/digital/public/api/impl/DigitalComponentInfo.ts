import {CircuitState}                                         from "core/public/api/impl/CircuitState";
import {ComponentInfoImpl}                                    from "core/public/api/impl/ComponentInfo";
import {DigitalComponentInfo as DigitalComponentInfoInternal} from "digital/internal/DigitalComponents";

import {DigitalComponentInfo} from "../DigitalComponentInfo";


export class DigitalComponentInfoImpl extends ComponentInfoImpl implements DigitalComponentInfo {
    public readonly inputPortGroups: readonly string[];
    public readonly outputPortGroups: readonly string[];

    public constructor(state: CircuitState, kind: string) {
        super(state, kind);

        const info = this.info;
        if (!(info instanceof DigitalComponentInfoInternal))
            throw new Error(`Received non-digital component info for ${kind}!`);

        this.inputPortGroups  = this.portGroups.filter((g) => (info.portGroupInfo[g] ===  "input"));
        this.outputPortGroups = this.portGroups.filter((g) => (info.portGroupInfo[g] === "output"));
    }
}
