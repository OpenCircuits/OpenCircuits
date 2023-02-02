import {CircuitMetadata} from "core/public";

import {Request} from "shared/utils/Request";

import {AuthState} from "./auth/AuthState";


export async function CreateUserCircuit(auth: AuthState, data: string): Promise<CircuitMetadata | undefined> {
    return JSON.parse(await Request({
        method:  "POST",
        url:     "api/circuits",
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
        data,
    })) as CircuitMetadata;
}

export async function UpdateUserCircuit(auth: AuthState, circuitId: string,
                                        data: string): Promise<CircuitMetadata | undefined> {
    return JSON.parse(await Request({
        method:  "PUT",
        url:     `api/circuits/${circuitId}`,
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
        data,
    })) as CircuitMetadata;
}

export async function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<string | undefined> {
    return await Request({
        method:  "GET",
        url:     `api/circuits/${circuitId}`,
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
    });
}

export async function QueryUserCircuits(auth: AuthState): Promise<CircuitMetadata[] | undefined> {
    return JSON.parse(await Request({
        method:  "GET",
        url:     "api/circuits",
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
    })) as CircuitMetadata[];
}

export async function DeleteUserCircuit(auth: AuthState, circuitId: string): Promise<boolean> {
    return (await Request({
        method:  "POST",
        url:     `api/circuits/${circuitId}/delete`,
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
    })) !== undefined;
}
