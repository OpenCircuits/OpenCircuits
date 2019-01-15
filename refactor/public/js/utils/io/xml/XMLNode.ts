import {Vector} from "../../math/Vector";

export class XMLNode {
    private root: XMLDocument;
    private node: ChildNode;

    public constructor(root: XMLDocument, node: ChildNode) {
        this.root = root;
        this.node = node;
    }

    public findChild(name: string): XMLNode {
        // Search for child node by name
        for (let i = 0; i < this.node.childNodes.length; i++) {
            if (this.node.childNodes[i].nodeName === name)
                return new XMLNode(this.root, this.node.childNodes[i]);
        }
        return undefined;
    }

    public createChild(tag: string): XMLNode {
        let child = this.root.createElement(tag);
        this.node.appendChild(child);
        return new XMLNode(this.root, child);
    }

    public addElement(tag: string, val: any) {
        let a = this.root.createElement(tag);
        let b = this.root.createTextNode(val);
        a.appendChild(b);
        this.node.appendChild(a);
    }

    // Helper method to add x,y components of vector
    public addVectorElement(tag: string, val: Vector) {
        this.addElement(tag+"x", val.x);
        this.addElement(tag+"y", val.y);
    }

}
