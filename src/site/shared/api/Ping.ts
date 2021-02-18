import {APIRequest} from "shared/utils/APIRequest";
import {AuthState} from "./auth/AuthState";

export function Ping(auth: AuthState): Promise<string> {
    return APIRequest({
        method: "GET",
        url: "api/ping",
        headers: {
            "authType": auth.getType(),
            "authId": auth.getId()
        }
    });
}
