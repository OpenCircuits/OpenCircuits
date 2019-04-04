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

    public setAttribute(tag: string, val: any) {
        if (!this.hasAttribute(tag))
            this.addAttribute(tag, val);
        else
            (<HTMLElement>this.findChild(tag).node.childNodes[0]).innerHTML = val;
    }

    // Helper method to add x,y components of vector
    public addVectorAttribute(tag: string, val: Vector) {
        this.addAttribute(tag+"x", val.x);
        this.addAttribute(tag+"y", val.y);
    }

    public replaceChildrenWithName(name: string, replace: string, deep: boolean = false): void {
        // Loop until all children with the given name are replaced
        let child;
        while ((child = this.findChild(name))) {
            // Create new child with 'replace' tag
            let newNode = this.createChild(replace);

            // Copy all children to new node
            let children = child.getChildren();
            for (let child of children)
                newNode.node.appendChild(child.node.cloneNode(true));

            // Set the node
            this.node.replaceChild(newNode.node, child.node);
        }

        if (deep) {
            // Replace in children
            let children = this.getChildren();
            for (let child of children)
                child.replaceChildrenWithName(name, replace, true);
        }
    }

    public findChildrenWithAttribute(attribute: string, deep: boolean = false): Array<XMLNode> {
        let arr: Array<XMLNode> = [];

        // Gather children with given attribute
        let children = this.getChildren();
        for (let child of children) {
            // console.log(child);
            if (child.hasAttribute(attribute))
                arr.push(child);

            if (deep)
                arr = arr.concat(child.findChildrenWithAttribute(attribute, true));
        }

        return arr;
    }

    public findChild(name: string): XMLNode {
        // Search for child node by name
        const child = Array.from(this.node.childNodes).find(child => child.nodeName === name);
        if (child)
            return new XMLNode(this.root, child);
        return undefined;
    }

    public getChildren(): Array<XMLNode> {
        return Array.from(this.node.childNodes).map(child => new XMLNode(this.root, child));
    }

    public hasAttribute(tag: string): boolean {
        let child = this.findChild(tag);
        if (child == undefined)
            return false;
        let nodes = child.node.childNodes;
        if (nodes.length != 1)
            return false;
        let node = nodes[0];
        return (node.nodeValue != undefined);
    }

    public getAttribute(tag: string): string {
        const child = this.findChild(tag);
        if (child)
            return child.node.childNodes[0].nodeValue;
        return "";
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
