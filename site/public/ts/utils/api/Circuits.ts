import $ from "jquery";

import {AuthState} from "../auth/AuthState";

export function CreateUserCircuit(auth: AuthState, data: string): Promise<string> {
    return $.when(
        $.ajax({
            method: "POST",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            },
            data: data
        })
    );
}

export function UpdateUserCircuit(auth: AuthState, circuitId: string, data: string): Promise<string> {
    return $.when(
        $.ajax({
            method: "PUT",
            url: "api/circuits/" + circuitId,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            },
            data: data
        })
    );
}

export function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<string> {
    return $.when(
        $.ajax({
            method: "GET",
            url: `api/circuits/${circuitId}`,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        })
    );
}

export function QueryUserCircuits(auth: AuthState): Promise<XMLDocument> {
    return $.when(
        $.ajax({
            method: "GET",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        })
    );
}
