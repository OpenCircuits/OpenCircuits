import {CircuitMetadata, CircuitMetadataDef} from "core/models/CircuitMetadata";
import {Request} from "shared/utils/Request";
import {AuthState} from "./auth/AuthState";

export async function UpdateUserCircuit(auth: AuthState, data: string, circuitId: string): Promise<CircuitMetadata | undefined> {
    return new CircuitMetadata(JSON.parse(await Request({
        method: "POST",
        url: `api/circuits/${circuitId === "" ? 0 : circuitId}`,
        headers: {
            "authType": auth.getType(),
            "authId": auth.getId()
        },
        data
    })) as CircuitMetadataDef);
}

export async function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<string | undefined> {
    return await Request({
        method: "GET",
        url: `api/circuits/${circuitId}`,
        headers: {
            "authType": auth.getType(),
            "authId": auth.getId()
        }
    });
}

export async function QueryUserCircuits(auth: AuthState): Promise<CircuitMetadata[] | undefined> {
    const arr = JSON.parse(await Request({
        method: "GET",
        url: "api/circuits",
        headers: {
            "authType": auth.getType(),
            "authId": auth.getId()
        }
    })) as CircuitMetadataDef[];
    return arr.map(data => new CircuitMetadata(data));
}

export async function DeleteUserCircuit(auth: AuthState, circuitId: string): Promise<boolean> {
    return (await Request({
        method: "POST",
        url: `api/circuits/${circuitId}/delete`,
        headers: {
            "authType": auth.getType(),
            "authId": auth.getId()
        }
    })) !== undefined;
}
