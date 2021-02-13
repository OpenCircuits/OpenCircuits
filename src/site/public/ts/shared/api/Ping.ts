import $ from "jquery";

import {AuthState} from "../../digital/auth/AuthState";

export function Ping(auth: AuthState): Promise<string> {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: "api/ping",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        }).done(resolve).fail(reject);
    });
}
