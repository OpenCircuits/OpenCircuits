import {AddErrE} from "../../utils/MultiError";
import {ComponentInfo} from "../ComponentInfo";

import {CircuitContext} from "./CircuitContext";
import {CircuitAPITypes} from "./Types";


export class ComponentInfoImpl<T extends CircuitAPITypes> implements ComponentInfo {
    protected readonly ctx: CircuitContext<T>;

    public readonly kind: string;

    public constructor(ctx: CircuitContext<T>, kind: string) {
        this.ctx = ctx;

        this.kind = kind;
    }

    protected getInfo() {
        return (
            // API-wise, clients specify IC-instance-kinds with as the IC ID,
            // but internally IC-kinds are just "IC", and the icId is stored separately.
            this.ctx.internal.getICs().has(this.kind)
                ? this.ctx.internal.getComponentInfo("IC", this.kind)
                : this.ctx.internal.getComponentInfo(this.kind)
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
