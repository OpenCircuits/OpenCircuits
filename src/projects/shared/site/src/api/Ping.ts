import {Request} from "shared/src/utils/Request";

import {AuthState} from "./auth/AuthState";


export function Ping(auth: AuthState): Promise<string> {
    return Request({
        method:  "GET",
        url:     "api/ping",
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
    });
}
