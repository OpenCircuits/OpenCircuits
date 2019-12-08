import $ from "jquery";

import {CircuitMetadata} from "core/models/CircuitMetadata";
import {Circuit} from "core/models/Circuit";

export function LoadExampleCircuit(data: CircuitMetadata): Promise<string> {
    return new Promise<Circuit>((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: `api/example/${data.getId()}`
        }).done(resolve).fail(reject);
    }).then((json: Circuit) => {
        return JSON.stringify(json); // TODO: fix this cause this is a hack
    });
}
