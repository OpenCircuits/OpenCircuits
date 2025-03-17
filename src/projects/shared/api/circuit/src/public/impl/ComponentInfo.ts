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
        return this.state.internal.getComponentInfo(this.kind)
            .mapErr(AddErrE(`API ComponentInfo: Attempted to get info with kind '${this.kind}' that doesn't exist!`))
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
