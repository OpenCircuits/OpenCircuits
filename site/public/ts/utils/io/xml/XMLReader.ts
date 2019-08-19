import {XMLNode} from "./XMLNode";

export class XMLReader {
    private root: XMLDocument;
    private rootNode: XMLNode;

    private metadataNode: XMLNode;
    private contentsNode: XMLNode;

    public constructor(root: XMLDocument) {
        this.root = root;
        this.rootNode = new XMLNode(this.root, this.root.childNodes[0]);

        this.metadataNode = this.rootNode.findChild("metadata");
        this.contentsNode = this.rootNode.findChild("contents");

        // Old file version didn't have Metadata
        if (!this.metadataNode) {
            this.metadataNode = this.rootNode;
            this.contentsNode = this.rootNode;
        }
    }

    public getVersion(): number {
        const root = this.metadataNode;
        if (root.hasAttribute("version"))
            return root.getIntAttribute("version");
        return -1;
    }

    public getName(): string {
        const root = this.metadataNode;
        if (root.hasAttribute("name"))
            return root.getAttribute("name");
        return undefined;
    }

    public getContentsNode(): XMLNode {
        return this.contentsNode;
    }

}
