import {XMLNode} from "core/utils/io/xml/XMLNode";
import {CircuitMetadataBuilder, CircuitMetadata} from "core/models/CircuitMetadata";

export function XMLToCircuitMetadata(xml: XMLDocument | XMLNode): CircuitMetadata {
    const root = (xml instanceof XMLNode) ? (xml) : (new XMLNode(xml, xml.children[0]));
    return new CircuitMetadataBuilder()
            .withId(root.getAttribute("id"))
            .withName(root.getAttribute("name"))
            .withDesc(root.getAttribute("desc"))
            .withOwner(root.getAttribute("owner"))
            .withThumbnail(root.getAttribute("thumbnail"))
            .withVersion(root.getAttribute("version"))
            .build();
}

export function XMLToCircuitMetadataList(xml: XMLDocument): CircuitMetadata[] {
    const root = new XMLNode(xml, xml.children[0]);
    return root.getChildren().map((metadata) => XMLToCircuitMetadata(metadata));
}
