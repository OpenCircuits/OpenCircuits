import $ from "jquery";

import {CircuitMetadata} from "core/models/CircuitMetadata";

export function LoadExampleCircuit(data: CircuitMetadata): Promise<XMLDocument> {
    return new Promise<XMLDocument>((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: `api/example/${data.getId()}`
        }).done(resolve).fail(reject);
    });
}
