import {serializable} from "core/utils/Serializer";

@serializable("CircuitMetadata")
export class CircuitMetadata {
    private id: string;
    private name: string;
    private owner: string;
    private desc: string;
    private thumbnail: string;
    private version: string;

    public constructor(builder: CircuitMetadataBuilder = new CircuitMetadataBuilder()) {
        this.id = builder.id;
        this.name = builder.name;
        this.owner = builder.owner;
        this.desc = builder.desc;
        this.thumbnail = builder.thumbnail;
        this.version = builder.version;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getOwner(): string {
        return this.owner;
    }

    public getDesc(): string {
        return this.desc;
    }

    public getThumbnail(): string {
        return this.thumbnail;
    }

    public getVersion(): string {
        return this.version;
    }

    public static Default(): CircuitMetadata {
        return new CircuitMetadataBuilder().build();
    }

    public buildOn(): CircuitMetadataBuilder {
        return new CircuitMetadataBuilder()
                .withId(this.id)
                .withName(this.name)
                .withOwner(this.owner)
                .withDesc(this.desc)
                .withThumbnail(this.thumbnail)
                .withVersion(this.version);
    }
}

export class CircuitMetadataBuilder {
    public id: string;
    public name: string;
    public owner: string;
    public desc: string;
    public thumbnail: string;
    public version: string;

    public constructor() {
        this.id = "";
        this.name = "Untitled Circuit";
        this.owner = "";
        this.desc = "";
        this.thumbnail = "";
        this.version = "1.1";
    }

    public withId(id: string): CircuitMetadataBuilder {
        this.id = id;
        return this;
    }

    public withName(name: string): CircuitMetadataBuilder {
        this.name = name;
        return this;
    }

    public withOwner(owner: string): CircuitMetadataBuilder {
        this.owner = owner;
        return this;
    }

    public withDesc(desc: string): CircuitMetadataBuilder {
        this.desc = desc;
        return this;
    }

    public withThumbnail(thumbnail: string): CircuitMetadataBuilder {
        this.thumbnail = thumbnail;
        return this;
    }

    public withVersion(version: string): CircuitMetadataBuilder {
        this.version = version;
        return this;
    }

    public build(): CircuitMetadata {
        return new CircuitMetadata(this);
    }

}
