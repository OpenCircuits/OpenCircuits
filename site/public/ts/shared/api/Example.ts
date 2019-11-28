import $ from "jquery";

import {CircuitMetadata} from "core/models/CircuitMetadata";

export function LoadExampleCircuit(data: CircuitMetadata): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: `api/example/${data.getId()}`
        }).done(resolve).fail(reject);
    });
}
