import {CircuitInfo}       from "core/utils/CircuitInfo";
import {InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "../EventHandler";


export const SnipWirePortsHandler: EventHandler = ({
    conditions: (event: InputManagerEvent, { circuit, selections }: CircuitInfo) =>
        (event.type === "keydown" &&
         event.key === "x" &&
         selections.amount() > 0 &&
         // Check if only nodes are being selected
         selections.all((id) => (circuit.getObj(id)?.kind === circuit.getNodeKind()))),

    getResponse: ({ circuit, history, selections }: CircuitInfo) => {
        // @TODO
        // const ports = selections.get().filter((o) => isNode(o)) as Node[];

        // // Deselect the ports and then snip them
        // history.add(new GroupAction([
        //     DeselectAll(selections),
        //     SnipGroup(designer, ports),
        // ], "Snip Wire Ports Handler"));
    },
});
