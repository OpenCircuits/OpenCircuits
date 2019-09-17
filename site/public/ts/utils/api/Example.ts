import $ from "jquery";

import {CircuitMetadata} from "../../models/CircuitMetadata";

export function LoadExampleCircuit(data: CircuitMetadata): Promise<XMLDocument> {
    return $.when(
        $.ajax({
            method: "GET",
            url: `api/example/${data.getId()}`
        })
    );
}
