import {CircuitMetadata} from "../models/CircuitMetadata";
import {MainDesignerController} from "../controllers/MainDesignerController";
import {Importer} from "../utils/io/Importer";

export const SideNavCircuitListView = (() => {
    const div = document.getElementById("my-circuits-list");

    const renderEntry = (circuitMetadata: CircuitMetadata) => {
        return '<div class="circuit_list_entry" data-circuit_id="' + circuitMetadata.getId() + '">' +
            '<span>' + circuitMetadata.getName() + '</span></div>'
    };

    return {
        PopulateList: function (circuitMetadatas: CircuitMetadata[]): void {
            let html = '';
            circuitMetadatas.forEach((metadata) => {
                html += renderEntry(metadata);
            });
            div.innerHTML = html;

            // Setup event handlers
            for (let a = 0; a < div.children.length; a++) {
                const child = div.children.item(a) as HTMLElement;
                if (child === undefined) {
                    continue;
                }

                child.onclick = () => {
                    MainDesignerController.FetchCircuit(child.getAttribute('data-circuit_id'));
                };
            }
        }
    };
})();

