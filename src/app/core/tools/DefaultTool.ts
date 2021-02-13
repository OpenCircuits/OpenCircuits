import {CircuitInfo} from "core/utils/CircuitInfo";
import {Event} from "core/utils/Events";
import {EventHandler} from "./EventHandler";


export class DefaultTool {
    protected handlers: EventHandler[];

    public constructor(...handlers: EventHandler[]) {
        this.handlers = handlers;
    }

    // Method called when this tool is currently active and an event occurs
    public onEvent(event: Event, info: CircuitInfo): boolean {
        for (const handler of this.handlers) {
            if (handler.conditions(event, info)) {
                handler.getResponse(info);
                return true;
            }
        }

        return false;
    }
}
