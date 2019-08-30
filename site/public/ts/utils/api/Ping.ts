import $ from "jquery";

import {AuthType} from "./AuthTypes";

export function Ping(authType: AuthType, authId: string): Promise<string> {
    return $.when(
        $.ajax({
            method: "GET",
            url: "api/ping",
            headers: {
                "authType": authType,
                "authId": authId
            }
        })
    );
}
