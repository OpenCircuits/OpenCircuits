import {uuid} from "core/utils/GUID";

import {AllComponentInfo}     from "core/models/info";
import {AnyComponent, AnyObj} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";
import {CalcPortConfigID}  from "core/views/PortInfo";

import {Action}      from "../Action";
import {GroupAction} from "../GroupAction";
import {Place}       from "../units/Place";

import {DeletePort} from "./DeletePort";


export function SetPortConfig(circuit: CircuitController<AnyObj>, c: AnyComponent, newConfig: string): Action {
    const curConfig = CalcPortConfigID(circuit, c);

    // Get the number of ports there should be for each group currently and in the new config
    const curGroups = curConfig.split(",").map((v) => parseInt(v));
    const newGroups = newConfig.split(",").map((v) => parseInt(v));

    const CreatePort = AllComponentInfo[c.kind].PortInfo.Default;

    return new GroupAction(
        newGroups.flatMap((newNumPorts, group) => {
            // Irrelevant grouping
            if (isNaN(newNumPorts))
                return [];

            // If one group is not NaN, then they should both be
            const curNumPorts = curGroups[group];
            if (isNaN(curNumPorts))
                throw new Error(`SetPortConfig: Config mismatch! ${newConfig} vs ${curConfig}`);

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
