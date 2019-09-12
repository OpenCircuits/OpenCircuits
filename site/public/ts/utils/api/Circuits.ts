import $ from "jquery";

import {XMLNode} from "../io/xml/XMLNode";
import {AuthState} from "../auth/AuthState";
import {CircuitMetadata, CircuitMetadataBuilder} from "../../models/CircuitMetadata";


function XMLToCircuitMetadata(xml: XMLDocument | XMLNode): CircuitMetadata {
    const root = (xml instanceof XMLNode) ? (xml) : (new XMLNode(xml, xml.children[0]));
    return new CircuitMetadataBuilder()
            .withId(root.getAttribute("id"))
            .withName(root.getAttribute("name"))
            .withDesc(root.getAttribute("desc"))
            .withOwner(root.getAttribute("owner"))
            .withThumbnail(root.getAttribute("thumbnail"))
            .build();
}
function XMLToCircuitMetadataList(xml: XMLDocument): CircuitMetadata[] {
    const root = new XMLNode(xml, xml.children[0]);
    return root.getChildren().map((metadata) => XMLToCircuitMetadata(metadata));
}

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
