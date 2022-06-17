import {Action} from "core/actions/Action";

import {Oscilloscope, ScopeConfig} from "analog/models/eeobjects";


export class SetScopeConfigAction implements Action {
    private o: Oscilloscope;

    private targetConfig: ScopeConfig;
    private prevConfig: ScopeConfig;

    public constructor(o: Oscilloscope, targetConfig: ScopeConfig) {
        this.o = o;
        this.targetConfig = targetConfig;
        this.prevConfig = o.getConfig();
    }

    public execute(): Action {
        this.o.setConfig(this.targetConfig);

        return this;
    }

    public undo(): Action {
        this.o.setConfig(this.prevConfig);

        return this;
    }

    public getName(): string {
        return "Changed scope config";
    }

}