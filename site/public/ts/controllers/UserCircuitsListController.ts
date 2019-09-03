import $ from "jquery";

import {LoadExampleCircuit} from "../utils/api/Example";
import {Importer} from "../utils/io/Importer";

import {MainDesignerController} from "./MainDesignerController";
import {ItemNavController} from "./ItemNavController";
import {HeaderController} from "./HeaderController";
import {QueryUserCircuits} from "../utils/api/Circuits";
import {XMLNode} from "../utils/io/xml/XMLNode";
import {CircuitMetadataBuilder} from "../models/CircuitMetadata";
import {SideNavCircuitPreview} from "../views/SideNavCircuitPreview";
import {AuthState} from "../utils/auth/AuthState";

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
        async UpdateCircuits(auth: AuthState): Promise<void> {
            UserCircuitsListController.ClearCircuits();

            const data = await QueryUserCircuits(auth);
            const root = new XMLNode(data, data.children[0]);

            const metadata = root.getChildren();
            console.log(metadata.length);
            for (const md of metadata) {
                const data = new CircuitMetadataBuilder()
                        .withId(md.getAttribute("id"))
                        .withName(md.getAttribute("name"))
                        .withDesc(md.getAttribute("desc"))
                        .withOwner(md.getAttribute("owner"))
                        .withThumbnail(md.getAttribute("thumbnail"))
                        .build();
                circuits.push(new SideNavCircuitPreview(data));
            }
        }
    }

})();
