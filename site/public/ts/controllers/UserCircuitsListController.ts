import $ from "jquery";

import {CircuitMetadata} from "../models/CircuitMetadata";
import {SideNavCircuitPreview} from "../views/SideNavCircuitPreview";
import {RemoteController} from "./RemoteController";

export const UserCircuitsListController = (() => {
    const userCircuitListParent = $("#user-circuit-list");

    let circuits: SideNavCircuitPreview[] = [];

    return {
        Init(): void {

        },
        ClearCircuits(): void {
            circuits.forEach((c) => c.remove());
            circuits = [];
        },
        UpdateCircuits(): void {
            UserCircuitsListController.ClearCircuits();

            RemoteController.ListCircuits(async (data: CircuitMetadata[]) => {
                data.forEach((d) => circuits.push(new SideNavCircuitPreview(d)));
            });
        }
    }

})();
