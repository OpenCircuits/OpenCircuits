import {Request} from "shared/site/utils/Request";

import {AuthState} from "./auth/AuthState";


export interface BackendCircuitMetadata {
    id: string;
    name: string;
    desc: string;
    thumbnail: string;
    version: string;
}

export interface BackendCircuitRequest {
    metadata: BackendCircuitMetadata;
    // Serialized contents
    contents: string;
}

export interface LoadCircuitResponse {
    metadata: BackendCircuitMetadata;
    // Serialized contents
    contents: string;
}

export async function CreateUserCircuit(auth: AuthState, request: BackendCircuitRequest): Promise<BackendCircuitMetadata | undefined> {
    return JSON.parse(await Request({
        method:  "POST",
        url:     "api/circuits",
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
        data: JSON.stringify(request),
    })) satisfies BackendCircuitMetadata;
}

export async function UpdateUserCircuit(auth: AuthState, request: BackendCircuitRequest): Promise<BackendCircuitMetadata | undefined> {
    return JSON.parse(await Request({
        method:  "PUT",
        url:     `api/circuits/${request.metadata.id}`,
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
        data: JSON.stringify(request),
    })) satisfies BackendCircuitMetadata;
}

export async function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<LoadCircuitResponse | undefined> {
    return JSON.parse(await Request({
        method:  "GET",
        url:     `api/circuits/${circuitId}`,
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
    })) satisfies LoadCircuitResponse;
}

export async function QueryUserCircuits(auth: AuthState): Promise<BackendCircuitMetadata[] | undefined> {
    return JSON.parse(await Request({
        method:  "GET",
        url:     "api/circuits",
        headers: {
            "authType": auth.getType(),
            "authId":   auth.getId(),
        },
    })) as BackendCircuitMetadata[];
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
