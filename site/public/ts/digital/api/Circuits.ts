import $ from "jquery";

import {AuthState} from "../auth/AuthState";
import {CircuitMetadata} from "digital/models/CircuitMetadata";

import {XMLToCircuitMetadata, XMLToCircuitMetadataList} from "./Utils";

export function CreateUserCircuit(auth: AuthState, data: string): Promise<CircuitMetadata> {
    return new Promise<XMLDocument>((resolve, reject) => {
        $.ajax({
            method: "POST",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            },
            data: data
        }).done(resolve).fail(reject);
    }).then(
        (xml: XMLDocument) => {
            return XMLToCircuitMetadata(xml);
        },
        (reason) => {
            console.error("Failed to create user circuit!", reason);
            return undefined;
        }
    );
}

export function UpdateUserCircuit(auth: AuthState, circuitId: string, data: string): Promise<CircuitMetadata> {
    return new Promise<XMLDocument>((resolve, reject) => {
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
        (xml: XMLDocument) => {
            return XMLToCircuitMetadata(xml);
        },
        (reason) => {
            console.error("Failed to update user circuit!", reason);
            return undefined;
        }
    );
}

export function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<XMLDocument> {
    return new Promise<XMLDocument>((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: `api/circuits/${circuitId}`,
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        }).done(resolve).fail(reject);
    });
}

export function QueryUserCircuits(auth: AuthState): Promise<CircuitMetadata[]> {
    return new Promise<XMLDocument>((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        }).done(resolve).fail(reject);
    }).then(
        (xml: XMLDocument) => {
            return XMLToCircuitMetadataList(xml);
        },
        (reason) => {
            console.error("Failed to update user circuit!", reason);
            return undefined;
        }
    );
}
