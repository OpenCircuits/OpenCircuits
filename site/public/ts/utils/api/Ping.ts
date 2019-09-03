import $ from "jquery";

import {AuthState} from "../auth/AuthState";

export function Ping(auth: AuthState): Promise<string> {
    return $.when(
        $.ajax({
            method: "GET",
            url: "api/ping",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        })
    );
}
