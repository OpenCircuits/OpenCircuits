import $ from "jquery";

import {AuthState} from "../auth/AuthState";
import {CircuitMetadata} from "../../models/CircuitMetadata";

import {XMLToCircuitMetadata, XMLToCircuitMetadataList} from "./Utils";

export function CreateUserCircuit(auth: AuthState, data: string): Promise<CircuitMetadata> {
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
    ).then((xml: XMLDocument, statusText, xhr) => {
        if (xhr.status < 200 || xhr.status >= 300) {
            console.error("Failed to create user circuit!", statusText)
            return;
        }
        return XMLToCircuitMetadata(xml);
    });
}

export function UpdateUserCircuit(auth: AuthState, circuitId: string, data: string): Promise<CircuitMetadata> {
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
    ).then((xml: XMLDocument, statusText, xhr) => {
        if (xhr.status < 200 || xhr.status >= 300) {
            console.error("Failed to update user circuit!", statusText)
            return;
        }
        return XMLToCircuitMetadata(xml);
    });
}

export function LoadUserCircuit(auth: AuthState, circuitId: string): Promise<XMLDocument> {
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

export function QueryUserCircuits(auth: AuthState): Promise<CircuitMetadata[]> {
    return $.when(
        $.ajax({
            method: "GET",
            url: "api/circuits",
            headers: {
                "authType": auth.getType(),
                "authId": auth.getId()
            }
        })
    ).then((xml: XMLDocument, statusText, xhr) => {
        if (xhr.status < 200 || xhr.status >= 300) {
            console.error("Failed to create user circuit!", statusText)
            return;
        }
        return XMLToCircuitMetadataList(xml);
    });
}
