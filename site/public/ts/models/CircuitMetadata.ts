import {XMLable} from "../utils/io/xml/XMLable";
import {XMLNode} from "../utils/io/xml/XMLNode";
import {XMLReader} from "../utils/io/xml/XMLReader";

export class CircuitMetadata implements XMLable {
    //
    // Fields the client can modify
    //
    name: string = '';
    version: number = -1;

    //
    // Fields the server will reject modification of
    //
    id: number = -1;
    // The user id of the owner of the file
    owner: string = '';

    public static parseXmlDocument = function(doc: XMLDocument): CircuitMetadata {
        const m = new CircuitMetadata();
        m.load((new XMLReader(doc)).getRoot());
        return m;
    };

    // TODO (KevinMackenzie) We should make our XML serialization more flexible so we don't
    // need two different functions
    public static parseMultipleXmlDocument = function(doc: XMLDocument): CircuitMetadata[] {
        const reader = new XMLReader(doc);
        return reader.getRoot().getChildren().map((value) => {
            const m = new CircuitMetadata();
            m.load(value);
            return m
        });
    };

    public save(node: XMLNode): void {
        node.addAttribute('id', this.id);
        node.addAttribute('version', this.version);
        node.addAttribute('name', this.name);
        node.addAttribute('owner', this.owner);
    }

    public load(node: XMLNode): void {
        this.id = parseInt(node.getAttribute('id'));
        this.version = parseInt(node.getAttribute('version'));
        this.name = node.getAttribute('name');
        this.owner = node.getAttribute('owner');
    }

    public getXMLName(): string {
        return "metadata";
    }

    public setName(name: string): void {
        if (name === null) {
            name = "";
        }
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getId(): number {
        return this.id;
    }

    public getOwner(): string {
        return this.owner;
    }
}
