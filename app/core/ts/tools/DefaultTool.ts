import {Action} from "core/actions/Action";

import {Tool} from "./Tool";

export abstract class DefaultTool extends Tool {

    public shouldDeactivate(): boolean {
        return false;
    }

    public abstract getAction(): Action;
}