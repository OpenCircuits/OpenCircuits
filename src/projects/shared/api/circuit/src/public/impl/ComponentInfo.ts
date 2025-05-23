import {AddErrE} from "../../utils/MultiError";
import {ComponentInfo} from "../ComponentInfo";

import {CircuitState, CircuitTypes} from "./CircuitState";


export class ComponentInfoImpl<T extends CircuitTypes> implements ComponentInfo {
    protected readonly state: CircuitState<T>;

    public readonly kind: string;

    public constructor(state: CircuitState<T>, kind: string) {
        this.state = state;

        this.kind = kind;
    }

    protected getInfo() {
        return (
            // API-wise, clients specify IC-instance-kinds with as the IC ID,
            // but internally IC-kinds are just "IC", and the icId is stored separately.
            this.state.internal.getICs().has(this.kind)
                ? this.state.internal.getComponentInfo(this.state.kinds.defaultICKind, this.kind)
                : this.state.internal.getComponentInfo(this.state.kinds.fromString(this.kind))
        ).mapErr(AddErrE(`API ComponentInfo: Attempted to get info with kind '${this.kind}' that doesn't exist!`))
         .unwrap();
    }

    public get portGroups() {
        return this.getInfo().portGroups;
    }

    public get defaultPortConfig() {
        return this.getInfo().defaultPortConfig;
    }

    public get portConfigs() {
        return this.getInfo().getValidPortConfigs();
    }
}
