import {CircuitInfo} from "core/utils/CircuitInfo";
import { AnalogCircuitInfo } from "analog/utils/AnalogCircuitInfo";
import {AnalogItemNav} from "../../../../site/pages/analog/src/containers/AnalogItemNav"
import {Event}       from "core/utils/Events";
import {EventHandler} from "../EventHandler";
import { AddGroup } from "core/actions/compositions/AddGroup";
import { IOObject } from "core/models";
import { IOObjectSet } from "core/utils/ComponentUtils";
import {GroupAction} from "core/actions/GroupAction";

import {DeselectAll} from "core/actions/units/Select";

export const VoltageSourceHandler: EventHandler = ({
    conditions: (event: Event, info: CircuitInfo) =>
        (event.type === "keydown" && event.key === "v"),

    getResponse: ({ input, camera, history, designer, selections }: CircuitInfo) => {
        // Keyboard shortcut to bring up Voltage Source Component
        const objs = selections.get().filter((o) => o instanceof IOObject) as IOObject[];
        const set = new IOObjectSet(objs);
        // Deselect the objects then remove them
        history.add(new GroupAction([
            AddGroup(designer, set),
        ], "Delete Handler"));

    },
})