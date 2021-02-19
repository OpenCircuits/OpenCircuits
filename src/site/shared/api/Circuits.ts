import {CircuitMetadata, CircuitMetadataDef} from "core/models/CircuitMetadata";
import {Circuit} from "core/models/Circuit";
import {AuthState} from "./auth/AuthState";
import {Request} from "shared/utils/Request";


export async function CreateUserCircuit(auth: AuthState, data: string): Promise<CircuitMetadata | undefined> {
    try {
        return new CircuitMetadata(JSON.parse(await Request({
            method: "POST",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            },
            data
        })) as CircuitMetadataDef);
    } catch (e) {
        console.error("Failed to create user circuit!", e);
        return undefined;
    }
}

export async function UpdateUserCircuit(auth: AuthState, circuitId: string, data: string): Promise<CircuitMetadata | undefined> {
    try {
        return new CircuitMetadata(JSON.parse(await Request({
            method: "PUT",
            url: `api/circuits/${circuitId}`,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            },
            data
        })) as CircuitMetadataDef);
    } catch (e) {
        console.error("Failed to create user circuit!", e);
        return undefined;
    }
}

export async function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<string | undefined> {
    try {
        return await Request({
            method: "GET",
            url: `api/circuits/${circuitId}`,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        });
    } catch (e) {
        console.error("Failed to load user circuit!", e);
        return undefined;
    }
}

export async function QueryUserCircuits(auth: AuthState): Promise<CircuitMetadata[] | undefined> {
    try {
        const arr = JSON.parse(await Request({
            method: "GET",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        })) as CircuitMetadataDef[];
        return arr.map(data => new CircuitMetadata(data));
    } catch (e) {
        console.error("Failed to query user circuits!", e);
        return undefined;
    }
}

export async function DeleteUserCircuit(auth: AuthState, circuitId: string): Promise<boolean> {
    try {
        return (await Request({
            method: "POST",
            url: `api/circuits/${circuitId}/delete`,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        })) !== undefined;
    } catch (e) {
        console.error("Failed to delete user circuit!", e);
        return false;
    }
}
