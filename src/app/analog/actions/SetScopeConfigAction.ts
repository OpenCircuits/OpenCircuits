import {Action} from "core/actions/Action";

import {Oscilloscope, ScopeConfig} from "analog/models/eeobjects";


export class SetScopeConfigAction implements Action {
    private readonly o: Oscilloscope;

    private readonly targetConfig: ScopeConfig;
    private readonly prevConfig: ScopeConfig;

    public constructor(o: Oscilloscope, targetConfig: ScopeConfig) {
        this.o = o;
        this.targetConfig = targetConfig;
        this.prevConfig = o.getConfig();

        this.execute();
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
