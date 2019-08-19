import {XMLNode} from "./XMLNode";

export class XMLReader {
    private root: XMLDocument;
    private rootNode: XMLNode;

    private metadataNode: XMLNode;
    private contentsNode: XMLNode;

    public constructor(root: XMLDocument) {
        this.root = root;
        this.rootNode = new XMLNode(this.root, this.root.childNodes[0]);

        if (!this.rootNode.findChild)
        this.metadataNode = this.rootNode.findChild("metadata");
        this.contentsNode = this.contentsNode.findChild("contents");
    }

    public getVersion(): number {
        const root = this.getRoot();
        if (root.hasAttribute("version"))
            return root.getIntAttribute("version");
        return -1;
    }

    public getName(): string {
        const root = this.getRoot();
        if (root.hasAttribute("name"))
            return root.getAttribute("name");
        return undefined;
    }

    public getContentsNode(): XMLNode {
        return this.rootNode;
    }

}
