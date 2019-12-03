import {XMLNode} from "./XMLNode";
import {Camera} from "core/utils/math/Camera"

export class XMLWriter {
    private root: XMLDocument;
    private rootNode: XMLNode;

    private metadataNode: XMLNode;
    private contentsNode: XMLNode;
    private cameraNode: XMLNode;

    public constructor(rootTag: string) {
        this.root = new DOMParser().parseFromString("<?xml version=\"1.0\" encoding=\"UTF-8\"?><"+rootTag+"></"+rootTag+">", "text/xml");
        this.rootNode = new XMLNode(this.root, this.root.childNodes[0]);
        this.metadataNode = this.rootNode.createChild("metadata");
        this.contentsNode = this.rootNode.createChild("contents");
        this.cameraNode = this.rootNode.createChild("camera");
    }

    public setName(name: string): void {
        this.metadataNode.addAttribute("name", name);
    }

    public setThumbnail(data: string): void {
        this.metadataNode.addAttribute("thumbnail", data);
    }

    public setVersion(version: string): void {
        this.metadataNode.addAttribute("version", version);
    }

    public setCamera(camera: Camera): void {
        this.cameraNode.addVectorAttribute("", camera.getPos());
        this.cameraNode.addAttribute("zoom",camera.getZoom());
    }

    public getContentsNode(): XMLNode {
        return this.contentsNode;
    }

    public serialize(): string {
        return new XMLSerializer().serializeToString(this.root.documentElement);
    }

}
