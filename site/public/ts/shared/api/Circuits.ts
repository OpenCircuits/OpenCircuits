import $ from "jquery";

import {AuthState} from "../../digital/auth/AuthState";
import {CircuitMetadata, CircuitMetadataDef} from "core/models/CircuitMetadata";

export function CreateUserCircuit(auth: AuthState, data: string): Promise<CircuitMetadata> {
    return new Promise<CircuitMetadataDef>((resolve, reject) => {
        $.ajax({
            method: "POST",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            },
            data: data
        }).done(resolve).fail(reject);
    })
    .catch((reason) => {
        console.error("Failed to create user circuit!", reason);
        return undefined;
    })
    .then(
        (def: CircuitMetadataDef) => {
            console.log(def);
            return new CircuitMetadata(def);
        },
        (reason) => {
            console.error("Failed to create user circuit!", reason);
            return undefined;
        }
    );
}

export function UpdateUserCircuit(auth: AuthState, circuitId: string, data: string): Promise<CircuitMetadata> {
    return new Promise<string>((resolve, reject) => {
        $.ajax({
            method: "PUT",
            url: "api/circuits/" + circuitId,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            },
            data: data
        }).done(resolve).fail(reject);
    }).then(
        (xml: string) => {
            return null;//XMLToCircuitMetadata(xml);
        },
        (reason) => {
            console.error("Failed to update user circuit!", reason);
            return undefined;
        }
    );
}

export function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: `api/circuits/${circuitId}`,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        }).done(resolve).fail(reject);
    }).then((str) => {
        console.log(str);
        return str;
    });
}

export function QueryUserCircuits(auth: AuthState): Promise<CircuitMetadata[]> {
    return new Promise<CircuitMetadataDef[]>((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        }).done(resolve).fail(reject);
    }).then(
        (arr: CircuitMetadataDef[]) => {
            return arr.map(data => new CircuitMetadata(data));
        },
        (reason) => {
            console.error("Failed to update user circuit!", reason);
            return undefined;
        }
    );
}

export function DeleteUserCircuit(auth: AuthState, circuitId: string): Promise<boolean> {
    return new Promise<string>((resolve, reject) => {
        $.ajax({
            method: "POST",
            url: "api/circuits/" + circuitId + "/delete",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        }).done(resolve).fail(reject);
    }).then(
        (_: string) => {
            return true;
        },
        (reason) => {
            console.error("Failed to delete user circuit!", reason);
            return false;
        }
    );
}

