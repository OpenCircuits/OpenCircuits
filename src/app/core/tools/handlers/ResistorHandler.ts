import {CircuitInfo} from "core/utils/CircuitInfo";
import {EventHandler} from "../EventHandler";

import {Event}       from "core/utils/Events";

import {Component} from "core/models";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {ItemNav} from "shared/containers/ItemNav";

import "src/site/analog/data/itemNavConfig.json";

import "src/app/analog/models/eeobjects/essentials/Resistor.ts"
import { Resistor } from "analog/models/eeobjects";

import {GroupAction} from "core/actions/GroupAction";

import {AddGroup} from "core/actions/compositions/AddGroup";

import {IOObject} from "core/models";
import { IOObjectSet } from "core/utils/ComponentUtils";

/**
 * Checks to see if the 'r' key is pressed on a selected objects and then deletes the objects.
 *
 * @param event      Is the event of the key press.
 */

export const ResistorHandler: EventHandler = ({
    conditions: (event: Event, { selections }: CircuitInfo) =>
         (event.type === "keydown" &&
         event.key === "r"),

        getResponse: ({ history, designer, selections }: CircuitInfo) => {
        const objs = selections.get().filter((o) => o instanceof IOObject) as IOObject[];
        const set = new IOObjectSet(objs)
        // Deselect the objects then remove them
        history.add(new GroupAction([
            AddGroup(designer, set),
        ], "Resistor Handler"));
    },
})