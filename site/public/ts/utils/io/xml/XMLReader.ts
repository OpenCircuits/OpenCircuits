import {XMLNode} from "./XMLNode";

export class XMLReader {
    private root: XMLDocument;
    private rootNode: XMLNode;

    public constructor(root: XMLDocument) {
        this.root = root;
        this.rootNode = new XMLNode(this.root, this.root.childNodes[0]);
    }

    public getRoot(): XMLNode {
        return this.rootNode;
    }

    public getVersion(): number {
        let root = this.getRoot();
        if (root.hasAttribute("version"))
            return root.getIntAttribute("version");
        return -1;
    }

    public getName(): string {
        let root = this.getRoot();
        if (root.hasAttribute("name"))
            return root.getAttribute("name");
        return undefined;
    }

}
