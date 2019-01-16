import {V,Vector} from "../../math/Vector";

export class XMLNode {
    private root: XMLDocument;
    private node: ChildNode;

    public constructor(root: XMLDocument, node: ChildNode) {
        this.root = root;
        this.node = node;
    }

    public createChild(tag: string): XMLNode {
        let child = this.root.createElement(tag);
        this.node.appendChild(child);
        return new XMLNode(this.root, child);
    }

    public addAttribute(tag: string, val: any) {
        let a = this.root.createElement(tag);
        let b = this.root.createTextNode(val);
        a.appendChild(b);
        this.node.appendChild(a);
    }

    // Helper method to add x,y components of vector
    public addVectorAttribute(tag: string, val: Vector) {
        this.addAttribute(tag+"x", val.x);
        this.addAttribute(tag+"y", val.y);
    }

    public findChild(name: string): XMLNode {
        // Search for child node by name
        for (let i = 0; i < this.node.childNodes.length; i++) {
            if (this.node.childNodes[i].nodeName === name)
                return new XMLNode(this.root, this.node.childNodes[i]);
        }
        return undefined;
    }

    public getChildren(): Array<XMLNode> {
        let arr = [];
        for (let i = 0; i < this.node.childNodes.length; i++)
            arr.push(new XMLNode(this.root, this.node.childNodes[i]));
        return arr;
    }

    public getAttribute(tag: string): string {
        return this.findChild(tag).node.childNodes[0].nodeValue;
    }

    public getBooleanAttribute(tag: string): boolean {
        return this.getAttribute(tag) === "true" ? true : false;
    }

    public getIntAttribute(tag: string): number {
        return parseInt(this.getAttribute(tag));
    }

    public getFloatAttribute(tag: string): number {
        return parseFloat(this.getAttribute(tag));
    }

    public getVectorAttribute(tag: string): Vector {
        return V(this.getFloatAttribute(tag+"x"),
                 this.getFloatAttribute(tag+"y"));
    }

    public getTag(): string {
        return this.node.nodeName;
    }

}
