import {uuid} from "core/utils/GUID";

import {AnyComponent, AnyObj} from "core/models/types";

import {CircuitController}                 from "core/controllers/CircuitController";
import {AllPortInfo}                       from "core/views/portinfo";
import {CalcPortAmounts, CalcPortConfigID} from "core/views/portinfo/utils";

import {Action}      from "../Action";
import {GroupAction} from "../GroupAction";
import {Place}       from "../units/Place";

import {DeletePort} from "./DeletePort";


export function SetPortConfig(circuit: CircuitController<AnyObj>, c: AnyComponent, newConfigID: number): Action {
    const curConfig = AllPortInfo[c.kind].PositionConfigs[CalcPortConfigID(circuit, c)];
    const newConfig = AllPortInfo[c.kind].PositionConfigs[newConfigID];

    // Get the number of ports there should be for each group currently and in the new config
    const curGroups = CalcPortAmounts(curConfig);
    const newGroups = CalcPortAmounts(newConfig);

    const CreatePort = AllPortInfo[c.kind].Default;

    // Get the list of ALL unique groups, in the case that curGroups has a group that
    //  newGroups does not have, or vice-versa.
    const allGroups = [...new Set([...Object.keys(curGroups), ...Object.keys(newGroups)])];

    return new GroupAction(
        allGroups.flatMap((group) => {
            const curNumPorts = (curGroups[group] ?? 0);
            const newNumPorts = (newGroups[group] ?? 0);

            // Need to add new ports for this group
            if (curNumPorts < newNumPorts) {
                return new Array(newNumPorts - curNumPorts).fill(0)
                    // Get index for new port
                    .map((_, j) => (curNumPorts + j))
                    // Create port
                    .map((index) => CreatePort(uuid(), c.id, group, index))
                    // Place port
                    .map((port) => Place(circuit, port));
            }

            // Need to remove ports for this group
            if (curNumPorts > newNumPorts) {
                return new Array(curNumPorts - newNumPorts).fill(0)
                    // Get index for port to remove
                    .map((_, j) => (curNumPorts - 1 - j))
                    // Find port
                    .map((index) => circuit.findPort(c, group, index)!)
                    // Remove port
                    .map((port) => DeletePort(circuit, port));
            }

            // Do nothing
            return [];
        })
    );
}
