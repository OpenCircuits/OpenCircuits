import {XMLNode} from "./XMLNode";

export class XMLWriter {
    private root: XMLDocument;
    private rootNode: XMLNode;

    private metadataNode: XMLNode;
    private contentsNode: XMLNode;

    public constructor(rootTag: string) {
        this.root = new DOMParser().parseFromString("<?xml version=\"1.0\" encoding=\"UTF-8\"?><"+rootTag+"></"+rootTag+">", "text/xml");
        this.rootNode = new XMLNode(this.root, this.root.childNodes[0]);
        this.metadataNode = this.rootNode.createChild("metadata");
        this.contentsNode = this.rootNode.createChild("contents");
    }

    public setName(name: string): void {
        this.metadataNode.addAttribute("name", name);
    }

    public setThumbnail(data: string): void {
        this.metadataNode.addAttribute("thumbnail", data);
    }

    public setVersion(version: number): void {
        this.metadataNode.addAttribute("version", version);
    }

    public getContentsNode(): XMLNode {
        return this.contentsNode;
    }

    public serialize(): string {
        return new XMLSerializer().serializeToString(this.root.documentElement);
    }

}
