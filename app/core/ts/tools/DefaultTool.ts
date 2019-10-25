import {Action} from "core/actions/Action";

import {Tool} from "./Tool";

export abstract class DefaultTool extends Tool {

    public shouldActivate(): boolean {
        return false;
    }

    public shouldDeactivate(): boolean {
        return false;
    }

    public abstract getAction(): Action;
}
