import $ from "jquery";

import {AuthType} from "./AuthTypes";

export function Ping(authType: AuthType, id: string): Promise<string> {
    return $.when(
        $.ajax({
            method: "GET",
            url: "api/ping",
            headers: {
                "auth": authType + " " + id
            }
        })
    );
}
